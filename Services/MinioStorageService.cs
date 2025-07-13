using Minio;
using Minio.DataModel.Args;

namespace OpenSpotify.API.Services
{
    public class MinioStorageService : IFileStorageService
    {
        private readonly IMinioClient _minioClient;
        private readonly string _bucketName;
        private readonly string _endpoint;
        private readonly bool _useSsl;

        public MinioStorageService(IMinioClient minioClient, IConfiguration config)
        {
            _minioClient = minioClient;
            _bucketName = config.GetValue<string>("Storage:Minio:BucketName") ?? "openspotify";
            _endpoint = config.GetValue<string>("Storage:Minio:Endpoint") ?? "localhost:9000";
            _useSsl = config.GetValue<bool>("Storage:Minio:UseSsl");
        }
        
        public async Task EnsureBucketExistsAsync()
        {
            var beArgs = new BucketExistsArgs().WithBucket(_bucketName);
            bool found = await _minioClient.BucketExistsAsync(beArgs);
            if (!found)
            {
                var mbArgs = new MakeBucketArgs().WithBucket(_bucketName);
                await _minioClient.MakeBucketAsync(mbArgs);
                
                var policy = $@"{{
                    ""Version"": ""2012-10-17"",
                    ""Statement"": [
                        {{
                            ""Effect"": ""Allow"",
                            ""Principal"": {{""AWS"":[""*""]}},
                            ""Action"": [""s3:GetObject""],
                            ""Resource"": [""arn:aws:s3:::{_bucketName}/*""]
                        }}
                    ]
                }}";
                var spArgs = new SetPolicyArgs().WithBucket(_bucketName).WithPolicy(policy);
                await _minioClient.SetPolicyAsync(spArgs);
            }
        }

        public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType)
        {
            await EnsureBucketExistsAsync();
            
            var objectName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
            
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName)
                .WithStreamData(fileStream)
                .WithObjectSize(fileStream.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs);
            
            return GetFileUrl(objectName);
        }

        public string GetFileUrl(string filePath)
        {
            var protocol = _useSsl ? "https" : "http";
            return $"{protocol}://{_endpoint}/{_bucketName}/{filePath}";
        }

        public async Task DeleteFileAsync(string fileUrl)
        {
            await EnsureBucketExistsAsync();
            
            var objectName = new Uri(fileUrl).AbsolutePath.Split('/').LastOrDefault();
            if (string.IsNullOrEmpty(objectName)) return;

            var rmArgs = new RemoveObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName);

            await _minioClient.RemoveObjectAsync(rmArgs);
        }
        public async Task<(Stream, string)> GetFileStreamAsync(string fileUrl)
        {
            await EnsureBucketExistsAsync();
        
            var objectName = new Uri(fileUrl).AbsolutePath.Split('/').LastOrDefault();
            if (string.IsNullOrEmpty(objectName))
            {
                throw new FileNotFoundException("Invalid file URL for MinIO object.");
            }

            var statArgs = new StatObjectArgs().WithBucket(_bucketName).WithObject(objectName);
            var stat = await _minioClient.StatObjectAsync(statArgs);

            var stream = new MemoryStream();
        
            var getObjectArgs = new GetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName)
                .WithCallbackStream(s => s.CopyTo(stream));
            
            await _minioClient.GetObjectAsync(getObjectArgs);
            stream.Position = 0;

            return (stream, stat.ContentType);
        }
    }
}
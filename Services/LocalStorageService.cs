namespace OpenSpotify.API.Services;

public class LocalStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly string _baseUrl;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public LocalStorageService(IConfiguration config, IHttpContextAccessor httpContextAccessor)
    {
        _basePath = config.GetValue<string>("Storage:Local:BasePath") ?? "wwwroot/uploads";
        _baseUrl = config.GetValue<string>("Storage:Local:BaseUrl") ?? "/uploads";
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";

        var directoryPath = Path.Combine(Directory.GetCurrentDirectory(), _basePath);

        if (!Directory.Exists(directoryPath)) Directory.CreateDirectory(directoryPath);

        var filePath = Path.Combine(directoryPath, uniqueFileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(stream);
        }

        var relativeUrl = $"{_baseUrl}/{uniqueFileName}";

        return GetFileUrl(relativeUrl);
    }

    public string GetFileUrl(string filePath)
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request == null) return filePath;

        var absoluteUrl = $"{request.Scheme}://{request.Host}{filePath}";
        return absoluteUrl;
    }

    public Task DeleteFileAsync(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl) || !Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
            return Task.CompletedTask;

        var relativePath = uri.AbsolutePath;

        var pathSegment = relativePath.TrimStart('/');

        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", pathSegment);

        if (File.Exists(fullPath))
            try
            {
                File.Delete(fullPath);
            }
            catch (IOException ex)
            {
                Console.WriteLine($"Error deleting file {fullPath}: {ex.Message}");
            }

        return Task.CompletedTask;
    }

    public Task<(Stream, string)> GetFileStreamAsync(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl) || !Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
            throw new FileNotFoundException("Invalid file URL.");

        var relativePath = uri.AbsolutePath;
        var pathSegment = relativePath.TrimStart('/');
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", pathSegment);

        if (File.Exists(fullPath))
            if (!File.Exists(fullPath))
                throw new FileNotFoundException("File not found at the specified path.", fullPath);

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var contentType = "application/octet-stream";

        return Task.FromResult(((Stream)stream, contentType));
    }
}
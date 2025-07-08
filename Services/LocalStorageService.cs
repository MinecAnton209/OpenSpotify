using OpenSpotify.API.Services;

public class LocalStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly string _baseUrl;

    public LocalStorageService(IConfiguration config)
    {
        _basePath = config.GetValue<string>("Storage:Local:BasePath") ?? "wwwroot/uploads";
        _baseUrl = config.GetValue<string>("Storage:Local:BaseUrl") ?? "/uploads";
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var directoryPath = Path.Combine(Directory.GetCurrentDirectory(), _basePath);

        if (!Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }

        var filePath = Path.Combine(directoryPath, uniqueFileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(stream);
        }

        return $"{_baseUrl}/{uniqueFileName}";
    }

    public string GetFileUrl(string filePath)
    {
        return filePath;
    }

    public Task DeleteFileAsync(string filePath)
    {
        var fileName = Path.GetFileName(filePath);
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), _basePath, fileName);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
        
        return Task.CompletedTask;
    }
}
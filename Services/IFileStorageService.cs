namespace OpenSpotify.API.Services
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType);

        string GetFileUrl(string filePath);
        
        Task DeleteFileAsync(string filePath);
    }
}
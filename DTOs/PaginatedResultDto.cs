namespace OpenSpotify.API.DTOs
{
    public class PaginatedResultDto<T>
    {
        public List<T> Items { get; set; } = new();
        public bool HasNextPage { get; set; }
        public int TotalCount { get; set; }
    }
}
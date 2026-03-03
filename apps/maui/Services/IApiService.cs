namespace WeirHere.Maui.Services;

public interface IApiService
{
    void SetToken(string? token);
    Task<T?> GetAsync<T>(string path, Dictionary<string, string>? query = null, CancellationToken cancellationToken = default);
    Task<T?> PostAsync<T>(string path, object? body = null, CancellationToken cancellationToken = default);
    Task<T?> PutAsync<T>(string path, object? body = null, CancellationToken cancellationToken = default);
}

namespace WeirHere.Maui.Services;

public interface IAuthService
{
    Task<bool> LoginAsync(CancellationToken cancellationToken = default);
    Task LogoutAsync(CancellationToken cancellationToken = default);
    Task<string?> GetTokenAsync(CancellationToken cancellationToken = default);
    bool IsAuthenticated { get; }
}

using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeirHere.Maui.Services;

namespace WeirHere.Maui.ViewModels;

public partial class LoginViewModel : ObservableObject
{
    private readonly IAuthService _authService;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string statusText = string.Empty;

    public LoginViewModel(IAuthService authService)
    {
        _authService = authService;
    }

    [RelayCommand]
    private async Task LoginAsync()
    {
        if (IsBusy) return;
        IsBusy = true;
        StatusText = "Signing in...";
        try
        {
            var ok = await _authService.LoginAsync();
            if (ok)
            {
                StatusText = "Signed in.";
                await Shell.Current.GoToAsync("..");
            }
            else
                StatusText = "Sign in failed or cancelled.";
        }
        catch (Exception ex)
        {
            StatusText = "Error: " + ex.Message;
        }
        finally
        {
            IsBusy = false;
        }
    }
}

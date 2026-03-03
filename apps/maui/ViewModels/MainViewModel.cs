using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace WeirHere.Maui.ViewModels;

public partial class MainViewModel : ObservableObject
{
    [RelayCommand]
    private async Task GoToJobsAsync()
    {
        await Shell.Current.GoToAsync("jobs");
    }

    [RelayCommand]
    private async Task GoToDashboardAsync()
    {
        await Shell.Current.GoToAsync("dashboard");
    }

    [RelayCommand]
    private async Task GoToLoginAsync()
    {
        await Shell.Current.GoToAsync("login");
    }
}

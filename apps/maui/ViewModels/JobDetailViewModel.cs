using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeirHere.Maui.Models;
using WeirHere.Maui.Services;

namespace WeirHere.Maui.ViewModels;

public partial class JobDetailViewModel : ObservableObject
{
    private readonly IApiService _apiService;

    [ObservableProperty]
    private string jobId = string.Empty;

    [ObservableProperty]
    private Job? job;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string statusText = string.Empty;

    public JobDetailViewModel(IApiService apiService)
    {
        _apiService = apiService;
    }

    [RelayCommand]
    private async Task LoadJobAsync()
    {
        if (string.IsNullOrEmpty(JobId) || IsBusy) return;
        IsBusy = true;
        StatusText = "Loading...";
        try
        {
            Job = await _apiService.GetAsync<Job>($"api/jobs/{Uri.EscapeDataString(JobId)}");
            StatusText = Job == null ? "Job not found." : string.Empty;
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

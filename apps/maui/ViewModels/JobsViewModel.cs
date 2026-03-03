using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeirHere.Maui.Models;
using WeirHere.Maui.Services;

namespace WeirHere.Maui.ViewModels;

public partial class JobsViewModel : ObservableObject
{
    private readonly IApiService _apiService;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string statusText = string.Empty;

    public ObservableCollection<Job> Jobs { get; } = new();

    public JobsViewModel(IApiService apiService)
    {
        _apiService = apiService;
    }

    [RelayCommand]
    private async Task LoadJobsAsync()
    {
        if (IsBusy) return;
        IsBusy = true;
        StatusText = "Loading...";
        Jobs.Clear();
        try
        {
            var list = await _apiService.GetAsync<List<Job>>("api/jobs");
            if (list != null)
            {
                foreach (var j in list)
                    Jobs.Add(j);
            }
            StatusText = Jobs.Count == 0 ? "No jobs found." : string.Empty;
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

    [RelayCommand]
    private async Task OpenJobAsync(Job job)
    {
        if (job?.Id == null) return;
        await Shell.Current.GoToAsync($"jobdetail?id={Uri.EscapeDataString(job.Id)}");
    }
}

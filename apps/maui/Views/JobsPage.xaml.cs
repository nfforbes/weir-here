namespace WeirHere.Maui.Views;

public partial class JobsPage : ContentPage
{
    public JobsPage(JobsViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        (BindingContext as ViewModels.JobsViewModel)?.LoadJobsCommand.Execute(null);
    }
}

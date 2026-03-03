namespace WeirHere.Maui.Views;

public partial class JobDetailPage : ContentPage, IQueryAttributable
{
    public JobDetailPage(JobDetailViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    public void ApplyQueryAttributes(IDictionary<string, object> query)
    {
        if (query.TryGetValue("id", out var idObj) && idObj is string id && BindingContext is ViewModels.JobDetailViewModel vm)
        {
            vm.JobId = id;
            vm.LoadJobCommand.Execute(null);
        }
    }
}

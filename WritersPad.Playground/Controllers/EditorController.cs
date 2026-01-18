using Microsoft.AspNetCore.Mvc;

namespace WritersPad.Playground.Controllers;

public class EditorController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}

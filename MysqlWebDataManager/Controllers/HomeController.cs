using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MysqlWebDataManager.Service.IService;
using System;

namespace MysqlWebDataManager.Controllers
{
    [Route("[controller]/[action]")]
    public class HomeController : Controller
    {
        private readonly IConnectionInfoService _service;
        public HomeController(IConnectionInfoService service)
        {
            _service = service;
        }

        public IActionResult Index()
        {
            string connectName = Request.Cookies["connection_name"];
            var connection = GetConnectionInfo(connectName);
            ViewBag.IsConnected = false;
            ViewBag.Connections = _service.GetConnections().data;
            if (connection != null)
            {
                if (OpenDatabase(connection.ConnectString))
                {
                    ViewBag.IsConnected = true;
                }
                ViewBag.ConnectName = connectName;

            }
            return View();
        }

        public IActionResult CancelConnect()
        {
            Response.Cookies.Delete("connection_name");
            return Ok(new { result = true });
        }

        public IActionResult ConnectDb(string connectName)
        {
            var connection = GetConnectionInfo(connectName);
            if (connection != null)
            {
                if (OpenDatabase(connection.ConnectString))
                {
                    SetCookie("connection_name", connection.ConnectionName, 180);
                    return Ok(new { result = true });
                }
                return Ok(new { result = false });
            }
            return Ok(new { result = false });
        }

        private Data.Models.ConnectionInfo GetConnectionInfo(string connectName)
        {
            return _service.GetSingleConnection(connectName);
        }

        private bool OpenDatabase(string connectSting)
        {
            (bool isOpen, SqlSugar.ISqlSugarClient conn) result = _service.OpenDatabase(connectSting);
            return result.isOpen;
        }

        public IActionResult AddConnection(string connectionName, string connectionString)
        {

            var res = _service.AddConnection(connectionName, connectionString);
            return Ok(new { res.result, res.message });
        }

        /// <summary>  
        /// set the cookie  
        /// </summary>  
        /// <param name="key">key (unique indentifier)</param>  
        /// <param name="value">value to store in cookie object</param>  
        /// <param name="expireTime">expiration time</param>  
        private void SetCookie(string key, string value, int? expireTime)
        {
            CookieOptions option = new CookieOptions();

            if (expireTime.HasValue)
                option.Expires = DateTime.Now.AddMinutes(expireTime.Value);
            else
                option.Expires = DateTime.Now.AddMinutes(30);

            Response.Cookies.Append(key, value, option);
        }
    }
}

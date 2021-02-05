var home;
(function (home) {
    function submitCallback() {
        // jquery 表单提交
        $("#connectForm").ajaxSubmit(function (res) {
            if (res.result) {
                alert('连接成功！');
                location.reload();
            }
            else {
                alert("找不到该连接");
            }
        });
        return false;
    }
    home.submitCallback = submitCallback;
    function cancelConnect() {
        $.ajax({
            //请求方式
            type: "Get",
            //请求的媒体类型
            //请求地址
            url: '/Home/CancelConnect',
            //数据，json字符串
            success: function (res) {
                if (res.result) {
                    alert("已断开连接");
                    location.reload();
                }
                else {
                    alert("连接断开失败");
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("连接断开失败");
            }
        });
    }
    home.cancelConnect = cancelConnect;
    function addConnection() {
        var connectionName = $("#connectionName").val().toString();
        var connectionString = $("#connectionString").val().toString();
        if (connectionName.length == 0) {
            return alert("连接名不能为空！");
        }
        if (connectionString.length == 0) {
            return alert("连接字符串不能为空！");
        }
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Home/AddConnection',
            data: { connectionName: connectionName, connectionString: connectionString },
            //数据，json字符串
            success: function (res) {
                alert(res.message);
                if (res.result) {
                    location.reload();
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("请求服务器失败！");
            }
        });
    }
    home.addConnection = addConnection;
})(home || (home = {}));
//# sourceMappingURL=home.js.map
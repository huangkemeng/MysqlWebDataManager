$(document).ready(function () {
    $(".goto-page").bind("keypress", function (event) {
        if (event.keyCode == 13) {
            location.href = "/Entity/Index?pageNumber=" + $(this).val();
        }
    });
});
var entity;
(function (entity) {
    function addSingleEntity() {
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Entity/AddSingleEntity',
            data: { tableName: $("#tableName").val(), active: $("#active").val() },
            //数据，json字符串
            success: function (res) {
                if (res.result) {
                    alert(res.message);
                    location.reload();
                }
                else {
                    alert(res.message);
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("创建失败");
            }
        });
    }
    entity.addSingleEntity = addSingleEntity;
    function CheckAllChange(ele) {
        if (ele.checked) {
            $(".row-checkbox").prop('checked', true);
        }
        else {
            $(".row-checkbox").prop('checked', false);
        }
    }
    entity.CheckAllChange = CheckAllChange;
    function GetCheckedRowsValues() {
        var _a;
        var keyIndex = $("thead>tr").find('th[data-iskey]').index();
        var keyName = $("thead>tr").find('th[data-iskey]').attr("data-DbColumnName").toString();
        var values = [];
        $(".row-checkbox:checked").parents('tr').each(function () {
            var keyValue = $(this).children('th').eq(keyIndex)[0].innerText.toString();
            values.push(keyValue);
        });
        return {
            tableName: "TableInfo",
            where: (_a = {}, _a[keyName] = values, _a)
        };
    }
    entity.GetCheckedRowsValues = GetCheckedRowsValues;
    function DisableEntities() {
        $.ajax({
            type: "POST",
            url: '/Entity/DisableEntities',
            data: { data: JSON.stringify(GetCheckedRowsValues()) },
            success: function (res) {
                if (res.result) {
                    alert(res.message);
                    location.reload();
                }
                else {
                    alert(res.message);
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("禁用过程中发生出错！");
            }
        });
    }
    entity.DisableEntities = DisableEntities;
    function EnableEntities() {
        $.ajax({
            type: "POST",
            url: '/Entity/EnableEntities',
            data: { data: JSON.stringify(GetCheckedRowsValues()) },
            success: function (res) {
                if (res.result) {
                    alert(res.message);
                    location.reload();
                }
                else {
                    alert(res.message);
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("启用过程中发生出错！");
            }
        });
    }
    entity.EnableEntities = EnableEntities;
    function DeleteEntities() {
        $.ajax({
            type: "POST",
            url: '/Entity/DeleteEntities',
            data: { data: JSON.stringify(GetCheckedRowsValues()) },
            success: function (res) {
                if (res.result) {
                    alert(res.message);
                    location.reload();
                }
                else {
                    alert(res.message);
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("删除过程中发生出错！");
            }
        });
    }
    entity.DeleteEntities = DeleteEntities;
})(entity || (entity = {}));
//# sourceMappingURL=entity.js.map
/// <reference path="jquery.d.ts"/>
/// <reference path="jqueryui.d.ts"/>
var es_datagrid = (function () {
    function es_datagrid(_jsondata, _tbl) {
        this.PostUrl = null;
        this.jsonData = _jsondata;
        this.tbl = $('#' + _tbl);
        var modifylag = 0;
        for (i = 0; i < this.jsonData.fieldname.length; i++) {
            for (j = 0; j < this.jsonData.modifyfield.length; j++) {
                if (this.jsonData.modifyfield[j] == this.jsonData.fieldname[i]) {
                    modifylag += 1 << i;
                }
            }
        }
        var tbl = $('#EDUTBL');
        var tr = "<tr class=even>";
        var heads = new Array();
        var modiheadcount = 0;
        for (var i = 0; i < this.jsonData.fieldname.length; i++) {
            if ((modifylag & (1 << i)) > 0) {
                var headid = this.jsonData.fieldname[i] + "_head";
                tr += "<td id=" + headid + ">" + this.jsonData.fieldname[i];
                heads[modiheadcount] = headid;
                modiheadcount++;
            }
            else {
                tr += "<td>" + this.jsonData.fieldname[i];
            }
        }
        tbl.append(tr);
        for (var i = 0; i < heads.length; i++) {
            this.head_click(heads[i]);
        }
        for (var i = 0; i < this.jsonData.data.length; i++) {
            var tr = "<tr>";
            for (var j = 0; j < this.jsonData.fieldname.length; j++) {
                var td = "<td>";
                if ((modifylag & (1 << j)) > 0) {
                    td = "<td class=M id=" + this.jsonData.fieldname[j] + "_"
                        + this.jsonData.data[i][this.jsonData.fieldname[0]]
                        + ">";
                }
                tr += td + this.jsonData.data[i][this.jsonData.fieldname[j]];
            }
            tbl.append(tr);
        }
        $('td.M').click(function (event) {
            es_datagrid.editCell($(this));
        });
        $("td.M").keydown(function (e) {
            var cell_id = $(this).attr('id');
            var rowid = 0;
            var count = 0;
            var cells = new Array();
            $('.M').each(function (i) {
                if ($(this).has(":input").length != 0) {
                    cells[count] = $(this);
                    if ($(this).attr('id') == cell_id)
                        rowid = count;
                    count++;
                }
            });
            switch (e.which) {
                case 38:
                    rowid--;
                    e.preventDefault();
                    break;
                case 40: //this is down! 
                case 13:
                    rowid++;
                    e.preventDefault();
                    break;
            }
            if (rowid < count && rowid >= 0) {
                cells[rowid].children().focus();
            }
        });
        this.GenOriginalData();
    }
    es_datagrid.editCell = function (cell) {
        var $txtinput = $('<textarea></textarea>');
        $txtinput.width(cell.width() - 10);
        $txtinput.height(cell.height() - 6);
        es_datagrid.bind_txtinput_paste($txtinput, cell);
        if (cell.has(":input").length == 0) {
            var val = cell.text();
            cell.text("");
            $txtinput.val(val);
            cell.append($txtinput);
        }
        return $txtinput.focus();
    };
    es_datagrid.bind_txtinput_paste = function ($txtinput, cell) {
        $txtinput.bind('paste', function (e) {
            var txt = e.originalEvent.clipboardData.getData('Text');
            var data_arr = new Array();
            var rowcnt = 0;
            for (var i = 0; i < txt.length; i++) {
                if (txt[i] == '\n') {
                    rowcnt++;
                }
                else {
                    if (data_arr[rowcnt] == null)
                        data_arr[rowcnt] = "";
                    data_arr[rowcnt] += txt[i];
                }
            }
            var colcnt = data_arr[0].split('\t').length;
            var f_data_arr = new Array();
            for (var i = 0; i < rowcnt; i++) {
                f_data_arr[i] = new Array();
            }
            for (var j = 0; j < rowcnt; j++) {
                var temp_ar = data_arr[j].split('\t');
                if (temp_ar.length >= colcnt) {
                    for (var k = 0; k < colcnt; k++)
                        f_data_arr[j][k] = temp_ar[k];
                }
            }
            //return f_data_arr;
            if (rowcnt > 1 || colcnt > 1) {
                if (confirm("�� " + rowcnt + "x" + colcnt + " ����,�O�_�߶K����" + rowcnt + "x" + colcnt + "��W?")) {
                    var c_cell = cell;
                    var c_cell_col_id = 0;
                    var f_cell = c_cell.parent().children('td:first');
                    for (i = 0; i < 20; i++) {
                        c_cell_col_id++;
                        if (c_cell.attr('id') == f_cell.attr('id')) {
                            break;
                        }
                        f_cell = f_cell.next();
                    }
                    for (var rid = 0; rid < rowcnt; rid++) {
                        for (var cid = 0; cid < colcnt; cid++) {
                            if (c_cell.has(":input").length > 0) {
                                var input = c_cell.children();
                                var strv = input.val(f_data_arr[rid][cid]);
                            }
                            else {
                                c_cell.text(f_data_arr[rid][cid]);
                            }
                            if (cid < colcnt - 1)
                                c_cell = c_cell.next();
                        }
                        c_cell = c_cell.parent().next('tr').children('td:first');
                        for (i = 1; i < c_cell_col_id; i++) {
                            c_cell = c_cell.next();
                        }
                    }
                    return false;
                }
                else {
                    return true;
                }
            }
        });
    };
    es_datagrid.closeedit = function () {
        $('.M').each(function (i) {
            if ($(this).has(":input").length == 0) {
            }
            else {
                var input = $(this).children();
                var strv = input.val();
                $(this).text(strv);
                input.remove();
            }
        });
    };
    es_datagrid.prototype.head_click = function (headid) {
        $("#" + headid).click(function (event) {
            var fix = $(this).attr('id').split('_')[0];
            var input_first = null;
            var modifymod = -1;
            $('.M').each(function (i) {
                if ($(this).attr('id').substr(0, fix.length) == fix) {
                    if (modifymod == -1) {
                        modifymod = $(this).has(":input").length;
                    }
                    if (modifymod == 0) {
                        if ($(this).has(":input").length == 0) {
                            var inputtxt = es_datagrid.editCell($(this));
                            if (input_first == null)
                                input_first = inputtxt;
                        }
                    }
                    else if (modifymod > 0) {
                        if ($(this).has(":input").length > 0) {
                            var input = $(this).children();
                            var strv = input.val();
                            $(this).text(strv);
                            input.remove();
                        }
                    }
                }
            });
            if (input_first != null)
                input_first.focus();
        });
    };
    es_datagrid.prototype.GenOriginalData = function () {
        var cnt = 0;
        es_datagrid.closeedit();
        var json = {};
        $('.M').each(function (i) {
            json[$(this).attr('id')] = $(this).text();
            cnt++;
        });
        es_datagrid.OriginalData = json;
        /*
        es_datagrid.OriginalData = "";
        $('.M').each(function(i) {
            if (cnt > 0) {
                es_datagrid.OriginalData = es_datagrid.OriginalData + ",";
            }
            es_datagrid.OriginalData = es_datagrid.OriginalData + '"' + $(this).attr('id') + '":"' + $(this).text() + '"';
            cnt++;
        });*/
    };
    es_datagrid.prototype.BindingFunctions = function (editbtn, savebtn, readmodbtn) {
        var jd = this.jsonData.fieldtype;
        var posturl = this.PostUrl;
        $('#' + editbtn).click(function (event) {
            var input_first = null;
            $('.M').each(function (i) {
                if ($(this).has(":input").length == 0) {
                    var inputtxt = es_datagrid.editCell($(this));
                    if (input_first == null)
                        input_first = inputtxt;
                }
            });
        });
        $('#' + savebtn).click(function (event) {
            try {
                alert(JSON.stringify(es_datagrid.OriginalData));
            }
            catch (e) { }
            es_datagrid.closeedit();
            var json = {};
            var jcnt = 0;
            var result_set = "";
            var error_msg = "";
            $('.M').each(function (i) {
                if (es_datagrid.OriginalData[$(this).attr('id')] != $(this).text()) {
                    json[$(this).attr('id')] = $(this).text().replace(/^\s+|\s+$/g, "");
                    var fH = $(this).attr('id').split('_')[0];
                    if (jd[fH] == "i" && !$(this).text().replace(/^\s+|\s+$/g, "").match(/^[0-9]+$/)) {
                        error_msg = '���~:��J���!\n' + $(this).attr('id') + '\n' + $(this).text();
                    }
                    else if (jd[fH] == "d" && !$(this).text().replace(/^\s+|\s+$/g, "").match(/^[0-9]+(\.\d+)?$/)) {
                        error_msg = '���~:��J�Ʀr!\n' + $(this).attr('id') + '\n' + $(this).text();
                    }
                }
            });
            try {
                alert(JSON.stringify(json));
            }
            catch (e) { }
            alert(posturl);
            if (posturl != null) {
                $.post(posturl, { datajson: json, keycode: '125678985432' }, function (data) {
                    alert("Update Data : " + data + error_msg);
                    for (var key in json) {
                        es_datagrid.OriginalData[key] = "-1";
                    }
                });
            }
            else {
                try {
                    alert("constructing ... POST:\n" + JSON.stringify(json)); //JSON.stringify(json));
                }
                catch (e) { }
            }
        });
        $('#' + readmodbtn).click(function () { es_datagrid.closeedit(); });
    };
    return es_datagrid;
})();
/*
String.prototype.trim = function() {
   return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
   return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
   return this.replace(/\s+$/,"");
}*/
/*
    public SplitPastFrmText(txt) {
        var data_arr = new Array();
        var fieldtxt = "";
        var rowcnt = 0;
        for (var i = 0; i < txt.length; i++) {
            if (txt[i] == '\n') {
                rowcnt++;
            } else {
                if (data_arr[rowcnt] == null) data_arr[rowcnt] = "";
                data_arr[rowcnt] += txt[i];
            }
        }
        var colcnt = data_arr[0].split('\t').length;
        var f_data_arr = new Array();
        for (var i = 0; i < colcnt; i++) {
            f_data_arr[i] = new Array();
        }
        for (var j = 0; j < rowcnt; j++) {
            var temp_ar = data_arr[j].split('\t');
            if (temp_ar.length >= colcnt) {
                for (var k = 0; k < colcnt; k++)
                    f_data_arr[k][j] = temp_ar[k];
            }
        }
        return f_data_arr;
    }

    public ArrayPast2Table(tablename: string, fieldname, fill_data) {
        //var table : HTMLTableElement;
        var table = <HTMLTableElement> document.getElementById(tablename);
        var rowLength = table.rows.length;
        var find_column_id = -1;
        var procmsg = '';
        var loopcnt = rowLength;
        if (fill_data.length < loopcnt) loopcnt = fill_data.length;
        for (var i = 0; i < loopcnt; i += 1) {
            var row = <HTMLTableRowElement> table.rows[i];
            var cellLength = row.cells.length;
            if (i == 0) {
                for (var y = 1; y < cellLength; y++) {
                    var cell = <HTMLTableCellElement> row.cells[y];
                    //if(cell.innerHTML.trim()==fieldname)
                    var cellinnerHTML = cell.innerHTML;
                    try { cellinnerHTML = cell.innerHTML.trim(); } catch (e) { }
                    if (cellinnerHTML == fieldname) {
                        find_column_id = y;
                        procmsg += "find field in table:" + fieldname + "at" + find_column_id;
                    }
                }
            } else {
                for (var y = 1; y < cellLength; y++) {
                    var cell = <HTMLTableCellElement> row.cells[y];
                    if (y == find_column_id) {
                        cell.innerHTML = fill_data[i];
                        procmsg += "\n" + i + ":" + y + ":" + cell.innerHTML + "-" + fill_data[i];
                    }
                }
            }
        }
        return procmsg;
    }*/

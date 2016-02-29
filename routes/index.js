var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/report', function (req, res, next) {
    var client = mysql.createConnection({
        host: 'rds80ubr9x806azaml24.mysql.rds.aliyuncs.com',
        user: 'motion2',
        password: 'motion2cs',
        database: 'motion2'
    });
    client.connect();
    var SqlOfnewestRst = "select " +
            "d.jrn, " +
            "d.status, " +
            "d.mdname, " +
            "d.name, " +
            "d.platform, " +
            "(select e.mdname from T_UI_MODNAME e where e.name = d.mdname) mdname_text, " +
            "(select f.name from T_UI_TESTCASE f where f.module = d.mdname and f.methodName = d.name) name_text, " +
            "(select f.step from T_UI_TESTCASE f where f.module = d.mdname and f.methodName = d.name) step, " +
            "d.duration, d.message, d.starttime " +
        "from " +
            "T_UI_TEST_HISTORY d " +
        "where d.jrn in (" +
            "select " +
                "c.jrn " +
            "from " +
                "(select distinct a.jrn from T_UI_TEST_HISTORY a order by a.jrn desc limit 1) c ) " +
            "order by" +
                " d.starttime desc;";
    console.log(SqlOfnewestRst);
    client.query(SqlOfnewestRst, function (err, rows, fields) {
        var maxtime = 0;
        for (var i = 0; i < rows.length; i++) {
            maxtime = Math.max(maxtime, rows[i]['duration']);
            var timestmp = rows[i]['starttime'];
            rows[i]['starttime'] = timestmp.toLocaleString();
        }
        res.render('report', {
            title: '测试报告',
            rows: rows,
            max_time: maxtime
        });

    });

});



router.post("/uploadCapture",function (req, res, next) {
    if(req.method.toUpperCase()=="POST"){
        var jrn = req.body["jrn"]||"unknow";
        if(!req.files["captures"]){
            return res.send("请传图片");
        }
        if(req.files["captures"].length>1){// 多个文件的情况
            req.files["captures"].forEach(function(file){uploadImg(file,jrn)});
        }else{ // 单个文件的情况
            uploadImg(req.files["captures"],jrn)
        }
        return res.send("ok post");
    }else{
        return res.send("ok get");
    }
});


/**
 * 图片上传方法
 * @param file 文件对象
 * @param jrn 批次号
 */
function uploadImg(file,jrn){

    console.log(arguments);
    // 获得文件的临时路径
    var tmp_path = file.path;
    console.log("临时文件:",file);
    // 指定文件上传后的目录
    var target_path = '../public/images/'+jrn+"/";
    if(!fs.existsSync(target_path)){
        //若不存在则创建
        fs.mkdirSync(target_path);}
    target_path = target_path+file.name;
    // 移动文件
    console.log("文件名:",file.name);
    fs.rename(tmp_path, target_path, function(err) {
        // 执行回调
        if (err) { //若报错
            return res.json({
                code: 0,
                msg: err.toString()
            });
        }
        ////其他,则删除临时文件夹文件,貌似不需要显示删除,直接就给移走了
        //fs.unlink(tmp_path, function(err) {
        //    if (err) throw err;
        //});
    });
}

module.exports = router;

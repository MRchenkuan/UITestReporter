var express = require('express');
var router = express.Router();
var mysql = require('mysql');

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
    var SqlOfnewestRst = "select * from T_UI_TEST_HISTORY d where d.jrn in (select c.jrn from (select distinct a.jrn from T_UI_TEST_HISTORY a order by a.jrn desc limit 1) c ) order by d.starttime desc;";
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

module.exports = router;

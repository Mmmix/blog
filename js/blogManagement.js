var localhost = "http://localhost:8080";
var app = new Vue({
	el: '#app',
	data: {
		listData: [],
		title: ''
	},
	methods: {
		getPage: function(n) {
			layui.use(['laypage', 'layer'], function() {
				var laypage = layui.laypage,
					layer = layui.layer;

				laypage.render({
					elem: 'pages',
					count: app.listData.total, //数据总数
					limit: app.listData.size, //每页显示的条数。laypage将会借助 count 和 limit 计算出分页数。、
					jump: function(obj, first) {
						//obj包含了当前分页的所有参数：
						
						//首次不执行
						if (!first) {
							app.getData(obj.curr);
							
						}
					}
				});
			});

		},
		getData: function(n) {
			var _this = this;
			console.log(_this.title);
			Vue.http.get(localhost + '/blog/list/' + n, {
				params: {
					pageSize: 5,
					title: _this.title
				}
			}).then(function(res) {
				_this.listData = res.body.data;
				console.log(app);
					
				if(n == 1){
					_this.getPage();
				}
				
			}, function() {
				console.log('获取博客信息失败！');
			});
		}

	}

});
app.getData(1);
//app.getUser(1);

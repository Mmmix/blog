var localhost = "http://localhost:8080";
var editIndex = '';
layui.use(['layer', 'layedit', 'jquery'], function() {});
var app = new Vue({
	el: '#app',
	data: {
		listData: [],
		searchTitle: '',
		addTitle: '',
		addTag: '',
		addCategory: '',
		addContent: '',
		selected: ''
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
					jump: function(obj, first) { //obj包含了当前分页的所有参数：
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
			Vue.http.get(localhost + '/blog/list/' + n, {
				params: {
					pageSize: 5,
					title: _this.searchTitle
				}
			}).then(function(res) {
				_this.listData = res.body.data;
				console.log(app);

				if (n == 1) {
					_this.getPage();
				}

			}, function() {
				console.log('获取博客信息失败！');
			});
		},
		addBlog: function() {
			layui.use(['layer', 'layedit', 'jquery'], function() {
				var layer = layui.layer;
				var layedit = layui.layedit;
				layer.open({
					type: 1,
					maxmin: true,
					area: '800px',
					// offset: '100px',
					title: '添加新的博客',
					content: layui.$('#formbox'),
					success: function(layero, index) {
						layui.form.render();
						layedit.set({
							uploadImage: {
								url: localhost + '/admin/richtext_img_upload' //接口url
								//type:'get'
							}
						});
						editIndex = layedit.build('add');
					},
					btn: ['确认', '取消'],
					yes: function(index, layero) {
						//按钮【按钮一】的回调
						app.submitAdd(index);
					}
				});
			});
		},
		submitAdd: function(index) {
			console.log(app.addContent);
			if (app.checkTitle() && app.checkTag() && app.checkCategory() && app.checkContent()) {
				Vue.http.post(localhost + '/admin/add', {
					title: app.addTitle,
					category: layui.$('#addCategory').val(),
					context: layui.layedit.getContent(editIndex),
					tags: app.addTag
				}, {
					emulateJSON: true
				}).then(function(res) {
					if (res.body.code == 200) {
						layui.layer.msg(res.body.data + '!', {
							icon: 1
						});
						layui.layer.close(index);
						app.addTitle = app.addTag = app.addContent = '';
						layui.$('#addCategory').val('');
					};
				}, function() {
					console.log('获取博客信息失败！');
				});
			}
		},
		checkTitle: function() {
			if (app.addTitle == '') {
				layui.layer.msg("标题不能为空！");
				return false;
			} else {
				return true;
			}
		},
		checkTag: function() {
			if (app.addTag == '') {
				layui.layer.msg("标签不能为空！");
				return false;
			} else {
				return true;
			}
		},
		checkCategory: function() {
			if (layui.$('#addCategory').val() == '') {
				layui.layer.msg("分类不能为空！");
				return false;
			} else {
				return true;
			}
		},
		checkContent: function() {
			if (layui.layedit.getContent(editIndex) == '') {
				layui.layer.msg("内容不能为空！");
				return false;
			} else {
				return true;
			}
		}

	}

});
app.getData(1);
//app.getUser(1);

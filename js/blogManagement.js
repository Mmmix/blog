var localhost = "http://localhost:8080";
var editIndex = '';
var myPageSize = 5;
layui.use(['layer', 'layedit', 'jquery'], function() {});
var app = new Vue({
	el: '#app',
	data: {
		listData: [],
		listComment: [],
		searchTitle: '',
		addTitle: '',
		addTag: '',
		addCategory: '',
		addContent: '',
		selected: '',
	},
	methods: {
		deleteBlog: function(n) {
			layui.layer.confirm('确认要删除吗？', {
				icon: 3,
				title: '确认删除'
			}, function(index) {
				layui.layer.close(index);
				Vue.http.get(localhost + '/admin/deleteBlog/' + n).then(function(res) {
					console.log(app);
					if (res.body.code == 200) {
						app.getData(app.listData.pageNum);
						//app.getPage();
						layui.layer.msg('删除成功', {
							icon: 1
						});
					} else {
						layui.layer.msg('删除失败', {
							icon: 2
						});
					}

				}, function() {
					console.log('获取博客信息失败！');
				});
			});
		},
		getPage: function(n) {
			layui.use(['laypage', 'layer'], function() {
				var laypage = layui.laypage,
					layer = layui.layer;

				laypage.render({
					elem: 'pages',
					count: app.listData.total, //数据总数
					limit: app.listData.size, //每页显示的条数。laypage将会借助 count 和 limit 计算出分页数。
					curr: app.listData.pageNum,
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
					pageSize: myPageSize,
					title: _this.searchTitle
				}
			}).then(function(res) {
				_this.listData = res.body.data;
				console.log(app);

				if (n <= 1 || n > app.listData.pages) {
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
				app.addTitle = app.addTag = app.addContent = '';
				layui.$('#addCategory').val('');
				layui.$('#add').val('');
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
						app.getData(1);
					};
				}, function() {
					console.log('获取博客信息失败！');
				});
			}
		},
		modBlog: function(id) {
			layui.use(['layer', 'layedit', 'jquery'], function() {
				var layer = layui.layer;
				var layedit = layui.layedit;
				Vue.http.get(localhost + '/blog/detail', {
					params: {
						id: id
					}
				}).then(function(res) {
					app.addTitle = res.body.data.title;
					layui.$('#add').val(res.body.data.context);
					layui.$('#addCategory').val(res.body.data.category);
					layedit.set({
						uploadImage: {
							url: localhost + '/admin/richtext_img_upload' //接口url
							//type:'get'
						}
					});
					editIndex = layedit.build('add');
					layer.open({
						type: 1,
						maxmin: true,
						area: '800px',
						title: '修改博客',
						content: layui.$('#formbox'),
						success: function(layero, index) {
							layui.form.render();
						},
						btn: ['确认', '取消'],
						yes: function(index, layero) {
							//按钮【按钮一】的回调
							app.submitMod(index, id);
						}
					});
				}, function() {
					console.log('获取博客信息失败！');
				});

			});
		},
		submitMod: function(index, id) {
			if (app.checkTitle() && app.checkTag() && app.checkCategory() && app.checkContent()) {
				Vue.http.post(localhost + '/admin/modifyBlog', {
					id: id,
					title: app.addTitle,
					category: layui.$('#addCategory').val(),
					context: layui.layedit.getContent(editIndex),
					tags: app.addTag
				}, {
					emulateJSON: true
				}).then(function(res) {
					console.log(res);
					if (res.body.code == 200) {
						layui.layer.msg(res.body.data + '!', {
							icon: 1
						});
						layui.layer.close(index);
						app.addTitle = app.addTag = app.addContent = '';
						layui.$('#addCategory').val('');
						app.getData(app.listData.pageNum);
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
		},
		showBlog: function() {
			app.$refs.blogHead.style.display = '';
			app.$refs.blogBody.style.display = '';
			app.$refs.commentHead.style.display = 'none';
			app.$refs.commentBody.style.display = 'none';
			app.getData(1);
		},
		showComment: function() {
			app.$refs.blogHead.style.display = 'none';
			app.$refs.blogBody.style.display = 'none';
			app.$refs.commentHead.style.display = '';
			app.$refs.commentBody.style.display = '';
			app.getComment(1);
		},
		getCommentPage: function(n) {
			layui.use(['laypage', 'layer'], function() {
				var laypage = layui.laypage,
					layer = layui.layer;

				laypage.render({
					elem: 'CommentPages',
					count: app.listComment.total, //数据总数
					limit: app.listComment.size, //每页显示的条数。laypage将会借助 count 和 limit 计算出分页数。
					curr: app.listComment.pageNum,
					jump: function(obj, first) { //obj包含了当前分页的所有参数：
						//首次不执行
						if (!first) {
							app.getComment(obj.curr);
						}
					}
				});
			});
		},
		getComment: function(n) {
			Vue.http.get(localhost + '/admin/listComment/' + n, {
				params: {
					pageSize: myPageSize
				}
			}).then(function(res) {
				app.listComment = res.body.data;
				console.log(app);

				if (n <= 1 || n > app.listData.pages) {
					app.getCommentPage();
				}

			}, function() {
				console.log('获取博客信息失败！');
			});
		},
		deleteComment: function(id) {
			layui.layer.confirm('确认要删除吗？', {
				icon: 3,
				title: '确认删除'
			}, function(index) {
				layui.layer.close(index);
				Vue.http.get(localhost + '/admin/deleteComment/' + id).then(function(res) {
					console.log(res);
					if (res.body.code == 200) {
						app.getComment(app.listComment.pageNum);
						layui.layer.msg('删除成功', {
							icon: 1
						});
					} else {
						layui.layer.msg('删除失败', {
							icon: 2
						});
					}

				}, function() {
					console.log('获取博客信息失败！');
				});
			});
		},
		replyComment: function(parentId, blogId) {
			layui.layer.open({
				type: 1,
				title: '回复评论',
				content: '<div style="margin: 5px 5px 0px 5px;"><textarea id="replyComment" placeholder="请输入回复内容" class="layui-textarea"></textarea></div>',
				area: '400px',
				btn: ['确认', '取消'],
				success: function(layero) {
					var btn = layero.find('.layui-layer-btn');
					btn.css('padding', '0px 0px 5px');
				},
				yes: function(index, layero) {
					if(layui.$('#replyComment').val() == ''){
						layui.layer.msg("请输入回复内容");
						return;
					}
					Vue.http.post(localhost + '/comment/add', {
						blogId: blogId,
						parentId: parentId,
						content: layui.$('#replyComment').val(),
						guestEmail: '123@456.com',
						guestName: '槑大佬'
						
					}, {
						emulateJSON: true
					}).then(function(res) {
						console.log(res);
						if (res.body.code == 200) {
							layui.layer.msg(res.body.data + '!', {
								icon: 1
							});
							layui.layer.close(index);
							layui.$('#replyComment').val('');
							app.showComment();
						};
					}, function() {
						console.log('获取博客信息失败！');
					});
				}
			});
		}
	}
});
app.getData(1);
//app.getUser(1);

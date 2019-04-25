/*
 * 动态添加 CSS 样式
 * @param selector {string} 选择器
 * @param rules {string} CSS样式规则
 * @param index {number} 插入规则的位置, 靠后的规则会覆盖靠前的，默认在后面插入
 */
var addCssRule = function () {
	// 创建一个 style， 返回其 stylesheet 对象
	function createStyleSheet() {
		var style = document.createElement('style');
		style.type = 'text/css';
		document.head.appendChild(style);
		return style.sheet;
	}

	// 创建 stylesheet 对象
	var sheet = createStyleSheet();

	// 返回接口函数
	return function (selector, rules, index) {
		index = index || 0;
		sheet.insertRule(selector + "{" + rules + "}", index);
	}
}();


;
(function ($) {
	$.fn.ZoomMark = function (method) {
		var settings = {
			'markList': [],
			'markColor': '#d31145',
			'markShape': 'square',
			'showMarkNumber': true,
			'afterMark': function () {}

		};
		var mContainer = this;
		var mImg;
		var mMarks = [];
		var position = {
			'x': 0,
			'y': 0,
			'scale': 1,
			'width': 0,
			'height': 0,
			'rotate': 0
		};
		var mousePosition = {
			'isMouseDown': false,
			x: 0,
			y: 0
		};
		var imgNaturalSize = [];
		this.publicMethods = {
			init: function (options) {
				if (mContainer.data('ZoomMarkData'))
					return;
				settings = $.extend(settings, options);

				mImg = mContainer.children('img');
				if (!mImg) {
					$.error('ZoomMark:Method ' + method + ' does not exist on e-smartzoom jquery plugin');
					return;
				}
				mImg.css('position', 'absolute');

				mContainer.data('ZoomMarkData', {
					'mImg': mImg,
					'mMarks': mMarks,
					'imgPosition': position,
					'mousePosition': mousePosition,
					'settings': settings
				});

				mContainer.css('overflow', 'hidden');
				mContainer.css('position', 'relative');
				mContainer.css('cursor', 'move');
				mContainer.css('text-align', 'left');
				var markStyle = 'position:absolute;transform:translate(-50%,-50%);' +
					'color:#FFF;text-align:center;';
				addCssRule('.mark', markStyle, 0);
				addCssRule('.mark:hover', 'cursor:hand', 0);
				//绑定鼠标事件
				document.oncontextmenu = function () {
					return false;
				}
				// mContainer.bind('contextmenu',function(){
				// 	event.returnValue=false;
				// });
				mContainer.mousewheel(mouseWheelHandler);
				mContainer.mousedown(function (event) {

					if (event.which == 1) {
						mousePosition.isMouseDown = true;
						mousePosition.x = event.pageX - mContainer.offset().left;
						mousePosition.y = event.pageY - mContainer.offset().top;

					}
					event.preventDefault();
				});
				$('#zoom-marker-img').mousemove(function (event) {
					if (mousePosition.isMouseDown) {
						var positionX = event.pageX - mContainer.offset().left; //获取当前鼠标相对img的X坐标  
						var positionY = event.pageY - mContainer.offset().top; //获取当前鼠标相对img的Y坐标 

						mContainer.publicMethods.move(positionX - mousePosition.x, positionY - mousePosition.y);
						mousePosition.x = positionX;
						mousePosition.y = positionY;
						event.preventDefault();
					}
				});
				mContainer.mouseup(function (event) {
					mousePosition.isMouseDown = false;
					event.preventDefault();
					//console.info('Released:up');
				});
				mContainer.mouseout(function (event) {
					mousePosition.isMouseDown = false;
					event.preventDefault();
					//	console.info('Released:out');
				});

				resetImg();
				reloadMarkers(options.markList);
				addCanvas(options.markList);

			},
			mark: function (x, y, name, str_device_id, icon) {
				var data = mContainer.data('ZoomMarkData');
				mMarks = data.mMarks;
				var lastMarkId = mMarks.length == 0 ? 0 : mMarks[mMarks.length - 1].id;
				mMarks.push({
					'id': lastMarkId + 1,
					'x': x,
					'y': y,
					'name': name,
					'str_device_id': str_device_id,
					'icon': icon,
					'color': data.settings.markColor,
					'available': true
				});
				var newMark = mMarks[mMarks.length - 1];
				mContainer.append($('<div class="mark" id="mark_' + newMark.id + '" data-device-id="' + str_device_id + '" style="left:' + x + 'px;top:' + y + 'px"><img src="' + icon + '" draggable="true"><span></span><div class="operate" style="display:none"></div><div class="warning" style="display:none"></div></div>'));
				var object = $('#mark_' + mMarks.length);
				object.css('left', x);
				object.css('top', y);

				object.mousedown(function (event) {
					if (event.which == 1) {
						mousePosition.isMouseDown = true;
					} else if (event.which == 3) {
						showMarkerCmd(newMark.id, str_device_id);

					}
					event.preventDefault();
				})

				object.mouseout(function () {
					$(this).find('.warning').hide();
					event.preventDefault();
				})
				object.mousemove(function (event) {
					if (mousePosition.isMouseDown) {
						var positionX = event.pageX - mContainer.offset().left; //获取当前鼠标相对img的X坐标  
						var positionY = event.pageY - mContainer.offset().top; //获取当前鼠标相对img的Y坐标 
						mMarks[mMarks.length - 1].x = positionX;
						mMarks[mMarks.length - 1].y = positionY;
						$('#mark_' + newMark.id).css('left', positionX);
						$('#mark_' + newMark.id).css('top', positionY);
						event.preventDefault();

					} else {

						$(this).find('.warning').show();
						$(this).find('.warning').html('<p>' + name + '</p>');

					}
				});
				object.mouseup(function (event) {
					mousePosition.isMouseDown = false;
					event.preventDefault();

				});

				object.mouseout(function (event) {
					mousePosition.isMouseDown = false;
					event.preventDefault();

				});



				return mMarks;
			},
			zoom: function (scale, x, y) {
				var data = mContainer.data('ZoomMarkData');
				var position = data.imgPosition;
				if (!x) {
					x = mContainer.width() / 2;
					y = mContainer.height() / 2;
				}

				if (scale > 1) {
					position.x = position.x - (x - position.x) * (scale - 1);
					position.y = position.y - (y - position.y) * (scale - 1);
				} else {
					position.x = position.x + (x - position.x) * (1 - scale);
					position.y = position.y + (y - position.y) * (1 - scale);
				}

				position.scale = position.scale * scale;
				position.width = position.width * scale;
				position.height = position.height * scale;
				updateImgRect();

				var mMarks = data.mMarks;
				for (var i = 0; i < mMarks.length; i++) {
					console.log(x, mMarks[i].x, scale);

					mMarks[i].x = x + (mMarks[i].x - x) * scale;
					mMarks[i].y = y + (mMarks[i].y - y) * scale;
				}
				updateMarksPosition(mMarks);
				addCanvas(mMarks);
			},
			move: function (x, y) {
				var data = mContainer.data('ZoomMarkData');
				var position = data.imgPosition;
				if (!x || !y) {
					return;
				}
				position.x += x;
				position.y += y;
				updateImgRect();

				var mMarks = data.mMarks;
				for (var i = 0; i < mMarks.length; i++) {
					mMarks[i].x = x + mMarks[i].x;
					mMarks[i].y = y + mMarks[i].y;
				}
				updateMarksPosition(mMarks);
				addCanvas(mMarks);
			},
			changeSettings: function (options) {
				var data = mContainer.data('ZoomMarkData');
				data.settings = $.extend(data.settings, options);
				mContainer.data('ZoomMarkData', data);

			},
			//参数id指的不是当前排序所在的顺序，而是内部id
			deleteMark: function (removeMarkId) {
				if (!removeMarkId)
					return;
				var data = mContainer.data('ZoomMarkData');

				for (var i = 0; i < data.mMarks.length; i++) {
					if (data.mMarks[i].id == removeMarkId) {
						data.mMarks[i].available = false;
					}
				}
				var device_id = $('#mark_' + removeMarkId).attr('data-device-id');
				$('#mark_' + removeMarkId).remove();
				deleteDeviceMarker(device_id, data.mMarks);
				//updateMarksNumber(data.mMarks);
				return data.mMarks;
			},
			rotate: function (angle) {
				var data = mContainer.data('ZoomMarkData');
				//更改图片参数
				var preAngle = data.imgPosition.rotate;
				data.imgPosition.rotate = angle;

				updateImgRect();
				//更新mark位置
				var marks = data.mMarks;
				var img = data.mImg;
				var centerX = parseFloat(img.css('left')) + img.width() / 2;
				var centerY = parseFloat(img.css('top')) + img.height() / 2;
				for (var i = 0; i < marks.length; i++) {
					var newMark = rotateMark({
						x: centerX,
						y: centerY
					}, marks[i], angle - preAngle);
					marks[i].x = newMark.x;
					marks[i].y = newMark.y;
				}
				updateMarksPosition(marks);
			},
			reset: function () {
				var data = mContainer.data('ZoomMarkData');
				var position = data.imgPosition;
				var img = data.mImg;
				var x = 0,
					y = 0;
				mContainer.publicMethods['zoom'](1.0 / position.scale);

				if (img.width() / img.height() > mContainer.width() / mContainer.height()) {
					y = (mContainer.height() - img.height()) / 2;
				} else {
					x = (mContainer.width() - img.width()) / 2;
				}
				mContainer.publicMethods['move'](x - position.x, y - position.y);
				mContainer.publicMethods['rotate'](0);
				return this;
			},
			destroy: function () {

			}

		}

		//参数判断
		if (!method || typeof method == 'object') {
			return this.publicMethods.init(arguments[0]);
		} else if (this.publicMethods[method]) {
			return this.publicMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			$.error('ZoomMark:Method ' + method + ' does not exist on ZoomMark jquery plugin');
		}

		function mouseWheelHandler(event, delta) {
			var scale = delta > 0 ? 2 : 0.5;
			mContainer.publicMethods.zoom(scale);
			event.preventDefault();
		}

		function resetImg() {
			//调整图片高宽，嵌入container
			if (mImg.width() / mImg.height() > mContainer.width() / mContainer.height()) {
				mImg.width(mContainer.width());
				var y = (mContainer.height() - mImg.height()) / 2;
				mImg.css('top', y + 'px');
				position.y = y;

			} else {
				mImg.height(mContainer.height());
				var x = (mContainer.width() - mImg.width()) / 2;
				mImg.css('left', x + 'px');
				position.x = x;
			}
			position.width = mImg.width();
			position.height = mImg.height();
		}


		function updateImgRect() {
			var data = mContainer.data('ZoomMarkData');
			var img = data.mImg;
			var position = data.imgPosition;
			img.css('left', position.x + 'px');
			img.css('top', position.y + 'px');
			img.css('transform', ' rotate(' + position.rotate + 'deg)');
			img.width(position.width);
			img.height(position.height);
		}
		//根据mMark数据更新位置
		function updateMarksPosition(marks) {
			for (var i = 0; i < marks.length; i++) {
				$('#mark_' + marks[i].id).css('left', marks[i].x);
				$('#mark_' + marks[i].id).css('top', marks[i].y);
			}
		}
		//根据mMark数据更新编号
		function updateMarksNumber(marks) {
			var t = 1;
			for (var i = 0; i < marks.length; i++) {
				if (marks[i].available) {
					$('#mark_' + marks[i].id).html(t++);
				}
			}
		}

		function reloadMarkers(markers) {
			$(markers).each(function (index, mark) {
				mContainer.publicMethods.mark(mark.x, mark.y, mark.name, mark.str_device_id, mark.icon);
			});
		}

		/**
		 * 添加canvas绘图层
		 * @param id        需要绘图的图像id
		 */
		function addCanvas(markers) {
			$('#canvas_marker').remove();
			var cWidth = $('#zoom-marker-img').width();
			var cHeight = $('#zoom-marker-img').height();
			const item = $("<canvas id='canvas_marker' width='" + cWidth + "' height='" +
				cHeight + "'  style='z-index: 10; position: absolute; left: 0px; top: 0px; pointer-events:none'>" +
				"Current browser is not support canvas tag</canvas>");
			mContainer.append(item);

			resizeCanvas();
			//在图上连线
			drawlines(markers);

		}


		/**
		 * 重绘canvas层，通过图片ID绑定
		 * @param id        需要重绘canvas的图像ID
		 */
		function resizeCanvas() {

			$('#canvas_marker').height($('#zoom-marker-img').height());
			$('#canvas_marker').width($('#zoom-marker-img').width());



		}

		function drawlines(markers) {
			const context = document.getElementById('canvas_marker').getContext("2d");
			// console.log(markerId);
			context.beginPath();
			context.lineWidth = 4;
			var j = 0;
			for (i = 0; i < markers.length; i++) {
				j = i + 1;
				if (j < markers.length) {
					if (markers[i].str_device_id == markers[j].str_device_id) {
						context.strokeStyle = 'blue';
						context.moveTo(markers[j].x, markers[j].y);
						context.lineTo(markers[i].x, markers[i].y);
					}
				}
			}
			context.stroke();
			context.closePath();
		}

		function rotateMark(center, mark, angle) {
			var r = Math.sqrt((mark.x - center.x) * (mark.x - center.x) + (mark.y - center.y) * (mark.y - center.y));
			if (r === 0)
				return mark;
			var mX = mark.x - center.x;
			var mY = mark.y - center.y;
			var iniAngle = (Math.asin(mX / r)) * 180 / Math.PI;
			iniAngle = mY > 0 ? (180 - iniAngle) : iniAngle;

			var x = center.x + r * Math.sin((iniAngle + angle) * Math.PI / 180);
			var y = center.y - r * Math.cos((iniAngle + angle) * Math.PI / 180);
			return {
				x: x,
				y: y
			};
		}
	}


})($);
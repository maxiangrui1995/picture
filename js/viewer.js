function seeVideo(device_id_str) {
  var url = "/index.php/Index/Event/liveplay?device_id=" + device_id_str;
  layer.open({
    type: 2,
    title: '视频',
    shadeClose: true,
    shade: 0.8,
    area: ['70%', '70%'],
    content: url,
  });
}

function operateDevice(device_id, cmd) {
  $.ajax({
    url: "/index.php/Index/Api/operateDevice",
    type: "post",
    data: {
      device_id: device_id,
      cmd: cmd
    },
    dataType: "json",
    success: function (data) {

    }
  });
}

function showMarkerCmd(markerId, device_id_str) {
  $('.choose_device').hide();
  $('.operate').remove();
  if ($('#mark_' + markerId).find('.operate').attr('style') == '') {
    $('#mark_' + markerId).find('.operate').attr('style', 'display:none');
  } else {
    $('#mark_' + markerId).find('.operate').show();
  }
  $('.mark').css('z-index', 10);
  $('#mark_' + markerId).css('z-index', 100);
  /* $.ajax({
    url: "/index.php/Index/Api/getcmd",
    type: 'post',
    data: {
      device_id: device_id_str
    },
    dataType: 'JSON',
    success: function (data) { */
      var cmd_html = '<ul>';
      cmd_html += '<li><a href="javascript:void(0);" onclick=deleteMarker(' + markerId + ',' +
        "'" + device_id_str + "')><i class='fa fa-trash-o'></i>删除设备</a></li>";
      var data = {
        cmdList:[{
          device_id_str:"1",
          cmd:"1",
          cmd_name:"1"
        }]
      };
      var cmdList = data.cmdList;
      if (cmdList.length > 0) {
        $.each(cmdList, function (key, val) {
          cmd_html += '<li><a href="javascript:void(0)" onclick=operateDevice' +
            "('" + device_id_str + "'," + val.cmd + ")><i class='fa fa-bell-o'></i>" + val.cmd_name + "</li>";
        });

      } else {
        cmd_html += '<li><a  href="javascript:void(0)" onclick=seeVideo' +
          "('" + device_id_str + "')><i class='fa fa-video-camera'></i>查看视频</a></li>";
      }
      if (data.warning > 0) {
        var event_url = "{:U('Index/Event/eventinfo')}/device_id/" + device_id_str
        cmd_html += '<li><a href="' + event_url + '"><i class="fa fa-bell-o"></i>查看事件</a></li>'
      }

      cmd_html += '</ul>';
      //alert($('.operate').length);
      if ($(this).find('.operate').length == 0) {
        $('#mark_' + markerId).append('<div class="operate">' + cmd_html + '</div>');
      } else {
        $(this).find('.operate').html(cmd_html);
      }
      $('.operate li a').click(function () {
        $('.operate li a').removeClass('active');
        $(this).addClass('active');
      })
      // $('#mark_'+markerId).find('.operate').html(cmd_html);
    /* }
  }); */
}

function addMapMarker(x, y, name, str_device_id, icon) {
  var offsetX = $('#viewer').offset().left;
  var offsetY = $('#viewer').offset().top;
  var imageWidth = $('#viewer').width();
  // 标记的点xy都是基于大图(6731*4761)
  // 底图的offset.left + left = m.x
  var left = (x * 6731) * imageWidth / 6731 + offsetX;
  var top = (y * 4761) * imageWidth / 6731 + offsetY;
  var style = "left:" + left + "px; top:" + top + "px;";
  var lastMarkId = markerData.length == 0 ? 0 : markerData[markerData.length - 1].id;
  markerData.push({
    'id': lastMarkId + 1,
    'x': x * 6731,
    'y': y * 4761,
    'name': name,
    'str_device_id': str_device_id,
    'icon': icon
  });

  var newMark = markerData[markerData.length - 1];
  var mark = "";
  mark += "<div class='mark' id='mark_" + newMark.id + "' style='" + style + "' title='" + newMark.name + "' data-index='" + newMark.id + "' data-device-id='" + newMark.str_device_id + "'>";
  mark += "<img src='" + newMark.icon + "'/>";
  mark += "</div>";

  $('#vi-container').append(mark);

}

function addDeviceMark(x, y) {
  $('.choose_device').show();
  $('.choose_device').offset({
    left: x,
    top: y
  });

  //var tox = (x - $('#viewer').offset().left) / $('#viewer').width() * 6731;
  // var toy = (y - $('#viewer').offset().top) / $('#viewer').height() * 4761;

  var tox = (x - $('#viewer').offset().left) / $('#viewer').width();
  var toy = (y - $('#viewer').offset().top) / $('#viewer').height();

  $('.choose_device').find('a').attr('data-position-x', tox);
  $('.choose_device').find('a').attr('data-position-y', toy);

}
$('.addDeviceBtn').click(function () {
  var x = $(this).attr('data-position-x');
  var y = $(this).attr('data-position-y');
  var url = "/index.php/Index/Map/device_list?map_id=" + map_id + "&region_id=" + region_id + "&x=" + x + "&y=" + y + '&callback=addMapMarker';
  layer.open({
    type: 2,
    title: '选择设备',
    shadeClose: true,
    shade: 0.8,
    area: ['50%', '70%'],
    content: url,
  });

  $('.choose_device').hide();

})

function updateDeviceMarker(str_device_id, markers) {
  var newMarker = new Array();
  $.each(markers, function (i, m) {
    if (m.str_device_id == str_device_id) {
      newMarker.push(m);
    }
  });
  $.ajax({
    url: "/index.php/Index/Api/updatePoints/map_id/" + map_id,
    type: "post",
    data: {
      device_id: str_device_id,
      markers: newMarker
    },
    dataType: "json",
    success: function (data) {

    }
  });
}

function deleteDeviceMarker(str_device_id, markers) {
  var newMarker = new Array();
  $.each(markers, function (i, m) {
    if (m.str_device_id == str_device_id) {
      newMarker.push(m);
    }
  });
  $.ajax({
    url: "/index.php/Index/Api/deletePoint/map_id/" + map_id,
    type: "post",
    data: {
      device_id: str_device_id,
      markers: newMarker
    },
    dataType: "json",
    success: function (data) {

    }
  });
}

var markerData = [{
  id: 1,
  x: 1,
  y: 1,
  name: "9号控制箱A区1灯",
  str_device_id: "str6517645661389721600",
  icon: "images/ico_device/4/map/0.png"
}]

$(function () {
  var canvasLine = null;
  var origanlW;
  var orignalH;
  // 加载机场大图
  var image = new Image();
  // image.src = map_img;
  image.src = 'images/1.jpg';
  // 大图加载成功
  image.onload = function () {
    //原图尺寸
    origanlW = image.width;
    orignalH = image.height;
    // 展示大图
    var ww = $("#vi-container").width();
    var hh = $("#vi-container").height();
    var imageW = 1920;
    var imageH = imageW * this.height / this.width;

    $('#viewer').attr('src', this.src).css({
      width: ww,
      //left: ww < imageW ? (ww - imageW) / 2 : (imageW - ww) / 2,
      // top: hh < imageH ? (hh - imageH) / 2 : (imageH - hh) / 2
    });
    $('.loading').hide();

    var offsetX = $('#viewer').offset().left;
    var offsetY = $('#viewer').offset().top;
    var imageWidth = $('#viewer').width();

    // 展示标记
    $.each(markerData, function (i, m) {
      // 标记的点xy都是基于大图(6731*4761)
      // 底图的offset.left + left = m.x
      var left = (m.x * origanlW) * imageWidth / origanlW + offsetX;
      var top = (m.y * orignalH) * imageWidth / origanlW + offsetY;
      var style = "left:" + left + "px; top:" + top + "px;";

      var mark = "";
      mark += "<div class='mark' id='mark_" + m.id + "' style='" + style + "' title='" + m.name + "' data-index='" + i + "' data-device-id='" + m.str_device_id + "'>";
      mark += "<img src='" + m.icon + "'/>";
      mark += "</div>";

      $('#vi-container').append(mark);
    });

    canvasLine = new CanvasLine();
    canvasLine.draw();
  }

  // 禁用鼠标右击
  document.oncontextmenu = function () {
    return false;
  }

  // 标记是否正在被拖拽
  var markerMoving = false;

  // 大图拖拽事件
  $("#vi-container").on("mousedown", function (e) {
    //隐藏图标下拉菜单
    $('.operate').remove();
    // 判断左右击
    if (e.button === 2) return false;

    // 改变鼠标样式
    $("#vi-container").addClass('drag');

    if (markerMoving) return false;

    e.preventDefault();

    var abs_x = e.clientX - $("#viewer").offset().left;
    var abs_y = e.clientY - $("#viewer").offset().top;

    document.onmousemove = function (e) {
      e.preventDefault();

      $("#viewer").css({
        'left': e.pageX - abs_x,
        'top': e.pageY - abs_y
      });


      var imageWidth = $('#viewer').width();
      var offsetX = $('#viewer').offset().left;
      var offsetY = $('#viewer').offset().top;

      // 标记
      $.each(markerData, function (i, m) {
        var left = (m.x * origanlW) * imageWidth / origanlW + offsetX;
        var top = (m.y * orignalH) * imageWidth / origanlW + offsetY;
        $('#mark_' + m.id).css({
          left: left,
          top: top
        })
      })

      canvasLine.clear();
      canvasLine.draw();
    };
    document.onmouseup = function (e) {
      // 移除鼠标样式
      $("#vi-container").removeClass('drag');
      e.preventDefault();
      document.onmousemove = null;
      document.onmouseup = null;
      // 

      var imageWidth = $('#viewer').width();
      var offsetX = $('#viewer').offset().left;
      var offsetY = $('#viewer').offset().top;

      // 标记
      $.each(markerData, function (i, m) {
        var left = (m.x * origanlW) * imageWidth / origanlW + offsetX;
        var top = (m.y * orignalH) * imageWidth / origanlW + offsetY;
        $('#mark_' + m.id).css({
          left: left,
          top: top
        })
      })

      canvasLine.draw();
    }
  })

  // 大图缩放事件
  $("#vi-container").on("mousewheel DOMMouseScroll", function (e) {
    e.preventDefault();
    //隐藏图标下拉菜单
    $('.operate').remove();
    var oldWidth = $('#viewer')[0].offsetWidth;
    var oldHeight = $('#viewer')[0].offsetHeight;
    var oldLeft = $('#viewer')[0].offsetLeft;
    var oldTop = $('#viewer')[0].offsetTop;

    var scaleX = (e.clientX - oldLeft) / oldWidth; //比例
    var scaleY = (e.clientY - oldTop) / oldHeight;


    var wheel = e.originalEvent.wheelDelta || -e.originalEvent.detail;
    var delta = Math.max(-1, Math.min(1, wheel));

    if (delta < 0) {
      //向下滚动
      $('#viewer').css({
        width: $('#viewer').width() * 0.9 + 'px',
      });

    } else {
      //向上滚动
      $('#viewer').css({
        width: $('#viewer').width() * 1.1 + 'px',
      })
    }

    var newWidth = $('#viewer')[0].offsetWidth;
    var newHeight = $('#viewer')[0].offsetHeight;

    $('#viewer')[0].style.left = oldLeft - scaleX * (newWidth - oldWidth) + "px";
    $('#viewer')[0].style.top = oldTop - scaleY * (newHeight - oldHeight) + "px";

    var imageWidth = $('#viewer').width();
    var offsetX = $('#viewer').offset().left;
    var offsetY = $('#viewer').offset().top;

    // 标记
    $.each(markerData, function (i, m) {
      var left = (m.x * origanlW) * imageWidth / origanlW + offsetX;
      var top = (m.y * orignalH) * imageWidth / origanlW + offsetY;
      $('#mark_' + m.id).css({
        left: left,
        top: top
      })
    })

    canvasLine.draw();
  })
  $('#vi-container').on('mousedown', '#viewer', function (e) {
    //隐藏图标下拉菜单
    $('.operate').remove();
    if (e.which == 3) {
      addDeviceMark(e.pageX, e.pageY);
      $('.operate').hide();
    }

  })
  // 标记拖拽事件
  $('#vi-container').on('mousedown', '.mark', function (e) {
    var $marker = $(this);
    var $viewer = $('#viewer');
    // 判断左右击
    if (e.button === 2) {
      $('.choose_device').hide();
      showMarkerCmd(markerData[$marker.attr('data-index')].id, markerData[$marker.attr('data-index')].str_device_id);
      return;
    }
    markerMoving = true;
    e.preventDefault();
    var abs_x = e.clientX - $marker.offset().left;
    var abs_y = e.clientY - $marker.offset().top;

    var imageWidth = $viewer.width();

    document.onmousemove = function (e) {
      e.preventDefault();

      $marker.css({
        'left': e.pageX - abs_x + $marker.width() / 2,
        'top': e.pageY - abs_y + $marker.height() / 2,
        'cursor': 'move'
      });

      canvasLine.draw();
    }

    document.onmouseup = function (e) {
      e.preventDefault();
      document.onmousemove = null;
      document.onmouseup = null;

      $marker.css({
        'cursor': 'pointer'
      });

      markerMoving = false;
      // 反求标记相对与大图的坐标
      var left = ($marker.position().left - $viewer.offset().left) / (imageWidth / origanlW) / origanlW;
      var top = ($marker.position().top - $viewer.offset().top) / (imageWidth / origanlW) / orignalH;

      markerData[$marker.attr('data-index')].x = left;
      markerData[$marker.attr('data-index')].y = top;
      updateDeviceMarker(markerData[$marker.attr('data-index')].str_device_id, markerData);

    }

  })


  function CanvasLine() {
    this.canvas = $("#vi-container").find('canvas')[0];
    this.canvas.width = $("#vi-container").width();
    this.canvas.height = $("#vi-container").height();
    this.context = this.canvas.getContext("2d");
  }
  CanvasLine.prototype.clear = function () {
    this.canvas.width = $("#vi-container").width();
    this.canvas.height = $("#vi-container").height();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  CanvasLine.prototype.draw = function () {
    this.clear();
    var context = this.context;
    context.beginPath();
    context.strokeStyle = '#41f423';
    context.globalAlpha = 0.8;
    context.lineWidth = 2;
    for (i = 0; i < markerData.length; i++) {
      j = i + 1;
      if (j < markerData.length) {
        var mark = $("#mark_" + markerData[i].id).position();
        var nextmark = $("#mark_" + markerData[j].id).position();
        if (markerData[i].str_device_id == markerData[j].str_device_id) {
          context.moveTo(nextmark.left, nextmark.top);
          context.lineTo(mark.left, mark.top);
        }
      }
    }
    context.stroke();
  }
})
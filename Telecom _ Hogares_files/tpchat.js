/*
TPBANNER : llamameApi.forBanner('#callme', '#callme-submit', '#callme-msg');


*/
var llamameApi = {
  _validTimeLlamame: function() {
   return (oTPInjector.env.date.getDay() != 0 && oTPInjector.env.date.getHours() >= 9 && oTPInjector.env.date.getHours() < 21); // 0 es domingo - <21, funciona hasta las 20:59
   //return false;
  
   
  },
  _validNumberLlamame: function(number) {
      var mprefix = number.match(/15/);
      var msg;
      if (/^[0-9]+$/.test(number) && !/\s/g.test(number) && number.length === 10 && !/^0/g.test(number)) {
          if (mprefix == null || mprefix.index != 0)
              return;
          msg = "Ingresá el número sin incluir el 15 si es celular";
      } else {
          if (number && (/\s/g.test(number) || !/^[0-9]+$/.test(number) || number.length != 10))
              msg = "El formato de la línea no es correcto";
          else if (number && /^0/g.test(number))
              msg = "Ingresá el número sin incluir el 0 en el código de área";
          else
              msg = "Ingresá un número telefónico";
      }
      return msg;
  },
  _apiCall: function(a, b, callback) {
      var data = { "phoneNumber": a, "schedule": b, "vdnIndex": 1 };
      $.ajax({
          url: "//" + (oTPInjector.env.name == 'PROD' ? "www" : "dev") + ".personal.com.ar/resources/apimanager.aspx",
          method: "POST",
          cache: false,
          data: data,
          success: function(response) { callback(response); },
          error: function(e) { callback(e); }
      });
  },
  forBanner: function(container, callmeInput, callmeInput2, callMeSubmit, callMeMessage) {
    var llamameBannerTemplate = 
    '<div class="col-xs-12 col-md-10">'+
    '<div class="row">'+
        '<div>'+
          '<div class="form-group col-xs-3 col-sm-4"><div class="input-group"><span class="input-group-addon">0</span><input id="llamame-banner-number0" type="text" class="form-control" placeholder="11"></div></div>'+
          '<div class="form-group col-xs-6 col-sm-6"><div class="input-group"><span class="input-group-addon">15</span><input id="llamame-banner-number1" class="form-control" type="tel" placeholder="12345678" maxlength="8"></div></div>'+
            '<div class="col-xs-3 col-sm-2">'+
                '<button id="callme-submit" class="btn btn-primary">LLAMAME</button>'+
            '</div>'+
            '<div id="callme-msg" class="col-xs-12 margin-top-5"></div>'+
        '</div>'+
    '</div>'+
    '</div>';
    $(container).append(llamameBannerTemplate);


    $(callmeInput + ',' + callmeInput2).focus(function(){
        if (swiper.autoplaying) {
            swiper.pauseAutoplay(1);
            swiper.autoplaying = false;
            swiper.autoplayTimeoutId = undefined;
        } 
    })
    $(callmeInput + ',' + callmeInput2).on("keyup", function (e) {
        this.value = this.value.replace(/[^0-9\.]/g, '');
    });

    var that = this;

      $(callMeSubmit).on("click", function (e) {
        var number = $(callmeInput).val() + $(callmeInput2).val();
        var iserror = that._validNumberLlamame(number);
        if (iserror) {
            $(callMeMessage).html(iserror).removeClass('text-white').addClass('text-white bg-danger').fadeIn("slow");
        } else {
            $(callMeMessage).html("").fadeOut("fast");
            var selectTimeValue= null;
              if(selectTimeValue==null){
                  selectTimeValue=1;
                  horarioElegido= "de 8 a 12hs.";
              }
              var schedule = that._validTimeLlamame() ? 0 : selectTimeValue;
              that._apiCall(number, schedule, function(response) {
                var respuesta = JSON.parse(response);
                if (0 == respuesta.code) {
                    $(callMeMessage).html("<b>Perfecto!</b> Te llamaremos a la brevedad").removeClass('text-white bg-danger').addClass('text-white bg-success').fadeIn("slow");
                    if (!swiper.autoplaying) {
                        swiper.startAutoplay();
                        $(number).val('');
                        $(callMeMessage).delay(5000).fadeOut("fast");
                    }
                } else {
                    $(callMeMessage).html(respuesta.msg).removeClass('text-white').addClass('text-white bg-danger').fadeIn("slow");
                }
            });
        }
    });
  },
  forChat: function(callmeInput0, callmeInput1, validationError, scheduleInput, callMeSubmit) {
      var that = this;
      $(callmeInput0 + ',' + callmeInput1).on("keyup", function(e) {
          this.value = this.value.replace(/[^0-9\.]/g, '');
      });
      $(callMeSubmit).on("click", function(e) {
          var number = $(callmeInput0).val() + $(callmeInput1).val();
          var iserror = that._validNumberLlamame(number);
          if (iserror) {
              $(callmeInput0 + ',' + callmeInput1).css('border-color', '#d9186b');
              $(validationError).html(iserror).fadeIn("fast");
          } else {
              $(callmeInput0 + ',' + callmeInput1).css('border-color', '');
              $(validationError).html('').fadeOut("fast");
              
              var horarioElegido = $("#llamame-b-schedule option:selected").text();
              var selectTimeValue= $(scheduleInput).val();
              if(selectTimeValue==null){
                  selectTimeValue=1;
                  horarioElegido= "de 8 a 12hs.";
              }
              var schedule = that._validTimeLlamame() ? 0 : selectTimeValue;
              that._apiCall(number, schedule, function(response) {
                var formChat = $("#llamame-body .form");
                    $('#llamame-body').html("");
                    var internalNumberLlamame= oTPChat.config.internalNumberLlamame; // LLamame Internal Number
                    try { response = JSON.parse(response); } catch (err) { //Error en la llamada a la WebAPI
                        $('#llamame-body').append(mensajeError);
                        $('#mensajeError').html(internalNumberLlamame);
                        $('#mensajeError').attr("href", "tel:"+internalNumberLlamame);
                        return;
                    }
                  var code = response.code;
                  var delayTime = 15000;
                  if (code == 0 || code == 19) { // si esta todo ok
                      $('#llamame-body').append(mensajeExito);
                      $('.number-placeholder').html(number);
                  } else if (code == 15) {
                      $('#llamame-body').append(mensajeExcedido); // si pasaste la cantidad
                  } else if (code >= 16 && code <= 18) { //ya agendado
                      $('#llamame-body').append(mensajeAgendado);
                      $('p.horario').html(horarioElegido);
                      $('.number-placeholder').html(number);
                  } else { //error generico
                      $('#llamame-body').append(mensajeError);
                      $('#mensajeError').html(internalNumberLlamame);
                      $('#mensajeError').attr("href", "tel:"+internalNumberLlamame);
                  }
                  setTimeout(function () {
                      $('#llamame-body').html("");
                      $('#llamame-body').append(formChat);
                      llamameApi.forChat("#llamame-chat-number0", "#llamame-chat-number1", "#number-error", "#llamame-b-schedule", "#llamame-b-submit");
                  }, delayTime);
                  $(".volver-form").on("click", function() {
                      $("#llamame-body").html("");
                      $('#llamame-body').append(formChat);
                      llamameApi.forChat("#llamame-chat-number0", "#llamame-chat-number1", "#number-error", "#llamame-b-schedule", "#llamame-b-submit");
                  })
              });
            }
      });
  },
  forModal: function(container, callmeInput0, callmeInput1, validationError, scheduleInput, callMeSubmit) {
      var llamameModalTemplate =
          '  <div class="col-xs-12">' +
          '     <div class="llamame-web-title">También podés hacerlo de forma telefónica</div>' +
          '     <div class="llamame-web-online"><span></span> Estamos online</div>' +
          '     <div class="llamame-web-offline"><span></span> De Lunes a Sábados de 9 a 21hs.</div>' +
          '  </div>' +
          '  <div class="col-xs-12 col-sm-6 llamame-button" id="llamame-button-1">' +
          // abri la modal del llamame
          '<span class="icono"></span>' +
          '<div class="right">' +
          '<span>Quiero que me llamen</span>' +
          '<p>Ingresá tu número y te llamamos gratis<br> ahora</p>' +
          '</div>' +
          '  </div>' +
          '  <div class="col-xs-12 col-sm-6 llamame-button" id="llamame-button-2">' +
          // llama al 0800
          '<span class="icono"></span>' +
          '<div class="right">' +
          '<span>Llamá al 0800 444 0800</span>' +
          '<a href="tel:08004440531">Llamá al 0800-444-0531</a>' +
          '<p>Comunicate ahora con un asesor</p>' +
          '</div>' +
          '</div>' +
          '<button type="button" class="btn btn-primary" id="button-llamame-modal" data-toggle="modal" data-target="#llamameModal" style="display:none;"></button>' +
          '<div id="llamameModal" class="modal modal-fit fade">' +
          '<div class="modal-dialog">' +
          '<div class="modal-content">' +
          '<div class="modal-header">' +
          '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
          '</div>' +
          '<div class="modal-body text-center">' +
          '<div class="form">'+
          '<span class="icono-llamada"></span>' +
          '<h3>Quiero que me llamen</h3>' +
          '<p class="available"><span></span>Estamos atendiendo</p>' +
          '<p class="not-available"><span></span> De Lunes a Sábados de 9 a 21hs.</p>' +
          '<p>Ingresá tu teléfono y te llamamos gratis ahora</p>' +
          '<div class="form-group col-xs-5"><div class="input-group">' +
          '<span class="input-group-addon">0</span>' +
          '<input id="llamame-modal-number0" type="text" class="form-control" placeholder="11">' +
          '</div></div>' +
          '<div class="form-group col-xs-7"><div class="input-group">' +
          '<span class="input-group-addon">15</span>' +
          '<input id="llamame-modal-number1" class="form-control" type="tel" placeholder="12345678" maxlength="8">' +
          '</div></div>' +
          '<p id="number-error-modal"></p>' +
          '<select id="llamame-modal-schedule" class="form-control">' +
          '  <option value="1" disabled selected hidden>Elegí el horario</option>'+
          '  <option value="1" placeholder="">de 9 a 12hs.</option>' +
          '  <option value="2" placeholder="">de 12 a 16hs.</option>' +
          '  <option value="3">de 16 a 21hs.</option>' +
          '</select>' +
          '<button id="modal-b-submit" class="btn btn-primary btn-block">Llamame Ahora</button>' +
          '</div>' +
          '</div>' +
          '<div class="modal-footer text-center">' +
          '<span class="venta">Venta telefónica</span>' +
          '<span class="llama">Llamá al 0800-444-0531</span>' +
          '<p class="horario">De Lunes a Viernes de 9 a 21hs</p>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>';
      $(container).append(llamameModalTemplate);
      
      var onTime = llamameApi._validTimeLlamame();
      if (onTime) {
          $('#llamame-modal-schedule').hide();
          $('#modal-b-submit').html("LLAMAME");
      } else {
          $('#modal-b-submit').css('clear', 'left');
          $('#modal-b-submit').html("AGENDAR LLAMADO");
      }

      var that = this;
      $(callmeInput0 + ',' + callmeInput1).on("keyup", function(e) {
          this.value = this.value.replace(/[^0-9\.]/g, '');
      });
      
      $(callMeSubmit).on("click", function(e) {
        var number = $(callmeInput0).val() + $(callmeInput1).val();
        var iserror = that._validNumberLlamame(number);
        if (iserror) {
            $(callmeInput0 + ',' + callmeInput1).css('border-color', '#d9186b');
            $(validationError).html(iserror).fadeIn("fast");
        } else {
            /* $(callMeSubmit).attr("data-toggle", "modal");
             $(callMeSubmit).attr("data-target", "#modal-mensajes-llamame");*/
            $(callmeInput0 + ',' + callmeInput1).css('border-color', '');
            $(validationError).html('').fadeOut("fast");

            var horarioElegido = $("#llamame-modal-schedule option:selected").text();
            var selectTimeValue= $(scheduleInput).val();
            if(selectTimeValue==null){
                selectTimeValue=1;
                horarioElegido= "de 8 a 12hs.";
            }
            var schedule = that._validTimeLlamame() ? 0 : selectTimeValue;
            that._apiCall(number, schedule, function(response) {
              var modalForm = $("#llamameModal .modal-body .form");
                $('#llamameModal .modal-body').html("");
                var internalNumberLlamame= oTPChat.config.internalNumberLlamame;
                  try { response = JSON.parse(response); } catch (err) { //Error en la llamada a la WebAPI
                      $('#llamameModal .modal-body').append(mensajeError);
                      $('#mensajeError').html(internalNumberLlamame);
                      $('#mensajeError').attr("href", "tel:"+internalNumberLlamame);
                      return;
                  }
                var code = response.code;
                if (code == 0 || code == 19) { // si esta todo ok
                    $('#llamameModal .modal-body').append(mensajeExito);
                    $('.number-placeholder').html(number);
                } else if (code == 15) { // si pasaste la cantidad
                    $('#llamameModal .modal-body').append(mensajeExcedido);
                } else if (code >= 16 && code <= 18) {
                    $('#llamameModal .modal-body').append(mensajeAgendado);
                    $('p.horario').html(horarioElegido);
                    $('.number-placeholder').html(number);
                } else { //error generico
                    $('#llamameModal .modal-body').append(mensajeError);
                }
                var delayTime = 15000;
                setTimeout(function() {
                  llamameApi.forModal2("#llamame-modal-number0", "#llamame-modal-number1", "#number-error-modal", "#llamame-modal-schedule", "#modal-b-submit");
                 //   llamameApi.forModal(container, "#llamame-modal-number0", "#llamame-modal-number1", "#number-error-modal", "#llamame-modal-schedule", "#llamame-modal-submit");
                }, delayTime);
                $(".volver-form").on("click", function() {
                    //soloModal("#llamame-modal-number0", "#llamame-modal-number1", "#number-error-modal", "#llamame-modal-schedule", "#llamame-modal-submit");
                    llamameApi.forModal2("#llamame-modal-number0", "#llamame-modal-number1", "#number-error-modal", "#llamame-modal-schedule", "#modal-b-submit");
                })
            });
        }
    })
  

  },

  forModal2: function(callmeInput0, callmeInput1, validationError, scheduleInput, callMeSubmit) {
    var soloModalTemplate = 
      '<div class="form">'+
          '<span class="icono-llamada"></span>' +
          '<h3>Quiero que me llamen</h3>' +
          '<p class="available"><span></span>Estamos atendiendo</p>' +
          '<p class="not-available"><span></span> De Lunes a Sábados de 9 a 21hs.</p>' +
          '<p>Ingresá tu teléfono y te llamamos gratis ahora</p>' +
          '<div class="form-group col-xs-5"><div class="input-group">' +
          '<span class="input-group-addon">0</span>' +
          '<input id="llamame-modal-number0" type="text" class="form-control" placeholder="11">' +
          '</div></div>' +
          '<div class="form-group col-xs-7"><div class="input-group">' +
          '<span class="input-group-addon">15</span>' +
          '<input id="llamame-modal-number1" class="form-control" type="tel" placeholder="12345678" maxlength="8">' +
          '</div></div>' +
          '<p id="number-error-modal"></p>' +
          '<select id="llamame-modal-schedule" class="form-control">' +
          '  <option value="1" disabled selected hidden>Elegí el horario</option>'+
          '  <option value="1" placeholder="">de 9 a 12hs.</option>' +
          '  <option value="2" placeholder="">de 12 a 16hs.</option>' +
          '  <option value="3">de 16 a 21hs.</option>' +
          '</select>' +
          '<button id="modal-b-submit" class="btn btn-primary btn-block">Llamame Ahora</button>' +
          '</div>';
          $('#llamameModal .modal-body').html("");
          $('#llamameModal .modal-body').append(soloModalTemplate);
    
    var onTime = llamameApi._validTimeLlamame();
    if (onTime) {
        $('#llamame-modal-schedule').hide();
        $('#modal-b-submit').html("LLAMAME");
    } else {
        $('#modal-b-submit').css('clear', 'left');
        $('#modal-b-submit').html("AGENDAR LLAMADO");
    }

    

    var that = this;
    $(callmeInput0 + ',' + callmeInput1).on("keyup", function(e) {
        this.value = this.value.replace(/[^0-9\.]/g, '');
    });
    
    $(callMeSubmit).on("click", function(e) {
      
      var number = $(callmeInput0).val() + $(callmeInput1).val();
      var iserror = that._validNumberLlamame(number);
      if (iserror) {
          $(callmeInput0 + ',' + callmeInput1).css('border-color', '#d9186b');
          $(validationError).html(iserror).fadeIn("fast");
      } else {
          /* $(callMeSubmit).attr("data-toggle", "modal");
           $(callMeSubmit).attr("data-target", "#modal-mensajes-llamame");*/
          $(callmeInput0 + ',' + callmeInput1).css('border-color', '');
          $(validationError).html('').fadeOut("fast");

          var horarioElegido = $("#llamame-modal-schedule option:selected").text();
          var selectTimeValue= $(scheduleInput).val();
          if(selectTimeValue==null){
              selectTimeValue=1;
              horarioElegido= "de 8 a 12hs.";
          }
          var schedule = that._validTimeLlamame() ? 0 : selectTimeValue;
          that._apiCall(number, schedule, function(response) {
            var modalForm = $("#llamameModal .modal-body .form");
              $('#llamameModal .modal-body').html("");
              var internalNumberLlamame= oTPChat.config.internalNumberLlamame; // LLamame Internal Number
                  try { response = JSON.parse(response); } catch (err) { //Error en la llamada a la WebAPI
                      $('#llamameModal .modal-body').append(mensajeError);
                      $('#mensajeError').html(internalNumberLlamame);
                      $('#mensajeError').attr("href", "tel:"+internalNumberLlamame);
                      return;
                  }
              var code = response.code;
              if (code == 0 || code == 19) { // si esta todo ok
                  $('#llamameModal .modal-body').append(mensajeExito);
                  $('.number-placeholder').html(number);
              } else if (code == 15) { // si pasaste la cantidad
                  $('#llamameModal .modal-body').append(mensajeExcedido);
              } else if (code >= 16 && code <= 18) {
                  $('#llamameModal .modal-body').append(mensajeAgendado);
                  $('p.horario').html(horarioElegido);
                  $('.number-placeholder').html(number);
              } else { //error generico
                  $('#llamameModal .modal-body').append(mensajeError);
              }
              var delayTime = 15000;
              setTimeout(function() {
                llamameApi.forModal2("#llamame-modal-number0", "#llamame-modal-number1", "#number-error-modal", "#llamame-modal-schedule", "#modal-b-submit");
               //   llamameApi.forModal(container, "#llamame-modal-number0", "#llamame-modal-number1", "#number-error-modal", "#llamame-modal-schedule", "#llamame-modal-submit");
              }, delayTime);
              $(".volver-form").on("click", function() {
                  //soloModal("#llamame-modal-number0", "#llamame-modal-number1", "#number-error-modal", "#llamame-modal-schedule", "#llamame-modal-submit");
                  llamameApi.forModal2("#llamame-modal-number0", "#llamame-modal-number1", "#number-error-modal", "#llamame-modal-schedule", "#modal-b-submit");
              })
          });
      }
  })


},
  
forCore: function(container, callmeInput0, callmeInput1, validationError, scheduleInput, callMeSubmit) {
  var llamameCoreTemplate =
      '<div class="form">' +
      '<div class="form-group col-xs-4 col-sm-3" style="padding-left:0;"><div class="input-group"><span class="input-group-addon">0</span><input id="llamame-core-number0" type="text" class="form-control" placeholder="11"></div></div>' +
      '<div class="form-group col-xs-8 col-sm-5"><div class="input-group"><span class="input-group-addon">15</span><input id="llamame-core-number1" class="form-control" type="tel" placeholder="12345678" maxlength="8"></div></div>' +
      '<button id="llamame-core-submit" class="btn btn-primary col-xs-12 col-sm-4"></button>' +
      '<select id="llamame-core-schedule" class="form-control" style="width:300px;">' +
      '  <option value="1" disabled selected hidden>Elegí el horario</option>'+
      '  <option value="1" placeholder="">de 9 a 12hs.</option>' +
      '  <option value="2" placeholder="">de 12 a 16hs.</option>' +
      '  <option value="3">de 16 a 21hs.</option>' +
      '</select>' +
      '<p id="number-error-core"></p>' +
      '<label class="llamame-core-b-label1" id="id-llamame-core-b-label1">Te llamaremos el próximo día hábil</label>' +
      '</div>';
  $(container).append(llamameCoreTemplate);
      
    var onTime = llamameApi._validTimeLlamame();
      if (onTime) {
          $('#llamame-core-schedule').hide();
          $('#id-llamame-core-b-label1').hide();
          $('#llamame-core-submit').html("LLAMAME");
      } else {
          $('#llamame-core-submit').html("AGENDAR LLAMADO");
      }
      var that = this;
      $(callmeInput0 + ',' + callmeInput1).on("keyup", function(e) {
          this.value = this.value.replace(/[^0-9\.]/g, '');
      });
      $(callMeSubmit).on("click", function(e) {
          var number = $(callmeInput0).val() + $(callmeInput1).val();
          var iserror = that._validNumberLlamame(number);
          if (iserror) {
              $(callmeInput0 + ',' + callmeInput1).css('border-color', '#d9186b');
              $(validationError).html(iserror).fadeIn("fast");
          } else {
              /* $(callMeSubmit).attr("data-toggle", "modal");
               $(callMeSubmit).attr("data-target", "#modal-mensajes-llamame");*/
              $(callmeInput0 + ',' + callmeInput1).css('border-color', '');
              $(validationError).html('').fadeOut("fast");

              var horarioElegido = $("#llamame-core-schedule option:selected").text();
              var selectTimeValue= $(scheduleInput).val();
              if(selectTimeValue==null){
                  selectTimeValue=1;
                  horarioElegido= "de 8 a 12hs.";
              }
              var schedule = that._validTimeLlamame() ? 0 : selectTimeValue;
              that._apiCall(number, schedule, function(response) {
                  $('#llamame-core').html("");
                  try { response = JSON.parse(response); } catch (err) { //Error en la llamada a la WebAPI
                      $('#llamame-core').append(mensajeError);
                      return;
                  }
                  var code = response.code;
                  if (code == 0 || code == 19) { // si esta todo ok
                      $('#llamame-core').append(mensajeExito);
                      $('.number-placeholder').html(number);
                  } else if (code == 15) { // si pasaste la cantidad
                      $('#llamame-core').append(mensajeExcedido);
                  } else if (code >= 16 && code <= 18) {
                      $('#llamame-core').append(mensajeAgendado);
                      $('p.horario').html(horarioElegido);
                      $('.number-placeholder').html(number);
                  } else { //error generico
                      $('#llamame-core').append(mensajeError);
                  }
                  var delayTime = 15000;
                  setTimeout(function() {
                      $("#llamame-core").html("");
                      llamameApi.forCore(container, "#llamame-core-number0", "#llamame-core-number1", "#number-error-core", "#llamame-core-schedule", "#llamame-core-submit");
                  }, delayTime);
                  $(".volver-form").on("click", function() {
                      $("#llamame-core").html("");
                      llamameApi.forCore(container, "#llamame-core-number0", "#llamame-core-number1", "#number-error-core", "#llamame-core-schedule", "#llamame-core-submit");
                  })
              });
          }
      })

        if(_tpi_isResponsive) {
          $("#llamame-core-schedule").insertAfter("#id-llamame-core-b-label1");
        }
      
  },
  forPopover: function(container, callmeInput0, callmeInput1, validationError, scheduleInput, callMeSubmit) {
      var llamamePopoverTemplate =
        '<button type="button" class="btn btn-default popover-open" rel="popover" data-placement="top">Llamame</button>'+
        '<div id="popover-content">'+
        '<a class="llamar" href="tel:08004440531"><span></span>Llama ahora al 0800 444 0531</a>'+
        '<a class="llamen"><span></span>Quiero que me llamen</a>'+
        '<div class="form" id="popover-form">'+
        '<p>Ingresá tu teléfono y te llamamos gratis ahora</p>' +
          '<div class="form-group col-xs-5"><div class="input-group">' +
          '<span class="input-group-addon">0</span>' +
          '<input id="llamame-pop-number0" type="text" class="form-control" placeholder="11">' +
          '</div></div>' +
          '<div class="form-group col-xs-7"><div class="input-group">' +
          '<span class="input-group-addon">15</span>' +
          '<input id="llamame-pop-number1" class="form-control" type="tel" placeholder="12345678" maxlength="8">' +
          '</div></div>' +
          '<p id="number-error-pop"></p>' +
          '<select id="llamame-pop-schedule" class="form-control">' +
          '  <option value="1" disabled selected hidden>Elegí el horario</option>'+
          '  <option value="1" placeholder="">de 9 a 12hs.</option>' +
          '  <option value="2" placeholder="">de 12 a 16hs.</option>' +
          '  <option value="3">de 16 a 21hs.</option>' +
          '</select>' +
          '<button id="pop-submit" class="btn btn-primary btn-block" onclick="">Llamame Ahora</button>'+
          '</div>'+
        '</div>';

      $(container).append(llamamePopoverTemplate);

      // PopOver Init
      
      var popOverSettings = {
          html: true,
          selector: '[rel="popover"]',
          title: '<a href="#" class="close" data-dismiss="alert">&times;</a>',
          content: function () {
              return $('#popover-content').html();
          }
      }
      $('body').popover(popOverSettings);

    $("button.popover-open").on("click",function() {
      $(document).on("click", ".popover .close" , function(){
        $(this).parents(".popover").popover('hide');
        $("button.popover-open").click();
    });
    })

      // PopOver Validations

      var onTime = llamameApi._validTimeLlamame();
            if (onTime) {
                $('#llamame-pop-schedule').hide();
                $('#pop-submit').html("LLAMAME");
            } else {
                $('#pop-submit').html("AGENDAR LLAMADO");
            }

            var that = this;
            $(callmeInput0 + ',' + callmeInput1).on("keyup", function(e) {
                this.value = this.value.replace(/[^0-9\.]/g, '');
            });

      var formPopover = $("#popover-form").html();

      $(document).on('click', '#pop-submit', function(e) {
          var formPop = $()
          var number = $(callmeInput0).val() + $(callmeInput1).val();
          var iserror = that._validNumberLlamame(number);
          if (iserror) {
            $(callmeInput0 + ',' + callmeInput1).css('border-color', '#d9186b');
            $(validationError).html(iserror).fadeIn("fast");
          } else {
            /* $(callMeSubmit).attr("data-toggle", "modal");
             $(callMeSubmit).attr("data-target", "#modal-mensajes-llamame");*/
            $(callmeInput0 + ',' + callmeInput1).css('border-color', '');
            $(validationError).html('').fadeOut("fast");

            var horarioElegido = $("#llamame-pop-schedule option:selected").text();
            var selectTimeValue= $(scheduleInput).val();
            if(selectTimeValue==null){
                selectTimeValue=1;
                horarioElegido= "de 8 a 12hs.";
            }
            var schedule = that._validTimeLlamame() ? 0 : selectTimeValue;
            that._apiCall(number, schedule, function(response) {
                $('#popover-form').html("");
                var internalNumberLlamame= oTPChat.config.internalNumberLlamame;
                try { response = JSON.parse(response); } catch (err) { //Error en la llamada a la WebAPI
                    $('#popover-form').append(mensajeError);
                    $('#popover-form #mensajeError').html(internalNumberLlamame);
                    $('#popover-form #mensajeError').attr("href", "tel:"+internalNumberLlamame);
                    return;
                }
                var code = response.code;
                if (code == 0 || code == 19) { // si esta todo ok
                    $('#popover-form').append(mensajeExito);
                    $('.number-placeholder').html(number);
                } else if (code == 15) { // si pasaste la cantidad
                    $('#popover-form').append(mensajeExcedido);
                } else if (code >= 16 && code <= 18) {
                    $('#popover-form').append(mensajeAgendado);
                    $('p.horario').html(horarioElegido);
                    $('.number-placeholder').html(number);
                } else { //error generico
                    $('#popover-form').append(mensajeError);
                    $('#popover-form h3#mensajeError').html(number);
                }
               /*  var delayTime = 15000;
                 setTimeout(function() {
                     $("#popover-form").html("");
                     $("#popover-form").html(formPopover);
                     llamameApi.forPopover2("#llamame-pop-number0", "#llamame-pop-number1", "#number-error-pop", "#llamame-pop-schedule", "#pop-submit");
                 }, delayTime);*/
                 $(".volver-form").on("click", function() {
                     $("#popover-form").html("");
                     $("#popover-form").html(formPopover);
                     $("button.popover-open").hide();
                     llamameApi.forPopover2("#llamame-pop-number0", "#llamame-pop-number1", "#number-error-pop", "#llamame-pop-schedule", "#pop-submit");
                 })
            });
          }
      });

      
  },
  forPopover2: function(callmeInput0, callmeInput1, validationError, scheduleInput, callMeSubmit) {
    var llamamePopoverTemplate =
      '<div id="popover-content">'+
      '<a class="llamar" href="tel:08004440531"><span></span>Llama ahora al 0800 444 0531</a>'+
      '<a class="llamen"><span></span>Quiero que me llamen</a>'+
      '<div class="form" id="popover-form">'+
      '<p>Ingresá tu teléfono y te llamamos gratis ahora</p>' +
        '<div class="form-group col-xs-5"><div class="input-group">' +
        '<span class="input-group-addon">0</span>' +
        '<input id="llamame-pop-number0" type="text" class="form-control" placeholder="11">' +
        '</div></div>' +
        '<div class="form-group col-xs-7"><div class="input-group">' +
        '<span class="input-group-addon">15</span>' +
        '<input id="llamame-pop-number1" class="form-control" type="tel" placeholder="12345678" maxlength="8">' +
        '</div></div>' +
        '<p id="number-error-pop"></p>' +
        '<select id="llamame-pop-schedule" class="form-control">' +
        '  <option value="1" disabled selected hidden>Elegí el horario</option>'+
        '  <option value="1" placeholder="">de 9 a 12hs.</option>' +
        '  <option value="2" placeholder="">de 12 a 16hs.</option>' +
        '  <option value="3">de 16 a 21hs.</option>' +
        '</select>' +
        '<button id="pop-submit" class="btn btn-primary btn-block" onclick="">Llamame Ahora</button>'+
        '</div>'+
      '</div>';

    $(container).append(llamamePopoverTemplate);

    // PopOver Init
    
    var popOverSettings = {
        html: true,
        selector: '[rel="popover"]',
        title: '<a href="#" class="close" data-dismiss="alert">&times;</a>',
        content: function () {
            return $('#popover-content').html();
        }
    }
    $('body').popover(popOverSettings);

  $("button.popover-open").on("click",function() {
    $(document).on("click", ".popover .close" , function(){
      $(this).parents(".popover").popover('hide');
      $("button.popover-open").click();
  });
  })

    // PopOver Validations

    var onTime = llamameApi._validTimeLlamame();
          if (onTime) {
              $('#llamame-pop-schedule').hide();
              $('#pop-submit').html("LLAMAME");
          } else {
              $('#pop-submit').html("AGENDAR LLAMADO");
          }

          var that = this;
          $(callmeInput0 + ',' + callmeInput1).on("keyup", function(e) {
              this.value = this.value.replace(/[^0-9\.]/g, '');
          });

    var formPopover = $("#popover-form").html();

    $(document).on('click', '#pop-submit', function(e) {
        var formPop = $()
        var number = $(callmeInput0).val() + $(callmeInput1).val();
        var iserror = that._validNumberLlamame(number);
        if (iserror) {
          $(callmeInput0 + ',' + callmeInput1).css('border-color', '#d9186b');
          $(validationError).html(iserror).fadeIn("fast");
        } else {
          /* $(callMeSubmit).attr("data-toggle", "modal");
           $(callMeSubmit).attr("data-target", "#modal-mensajes-llamame");*/
          $(callmeInput0 + ',' + callmeInput1).css('border-color', '');
          $(validationError).html('').fadeOut("fast");

          var horarioElegido = $("#llamame-pop-schedule option:selected").text();
          var selectTimeValue= $(scheduleInput).val();
          if(selectTimeValue==null){
              selectTimeValue=1;
              horarioElegido= "de 8 a 12hs.";
          }
          var schedule = that._validTimeLlamame() ? 0 : selectTimeValue;
          that._apiCall(number, schedule, function(response) {
              $('#popover-form').html("");
              var internalNumberLlamame= oTPChat.config.internalNumberLlamame;
                try { response = JSON.parse(response); } catch (err) { //Error en la llamada a la WebAPI
                    $('#popover-form').append(mensajeError);
                    $('#popover-form #mensajeError').html(internalNumberLlamame);
                    $('#popover-form #mensajeError').attr("href", "tel:"+internalNumberLlamame);
                  return;
              }
              var code = response.code;
              if (code == 0 || code == 19) { // si esta todo ok
                  $('#popover-form').append(mensajeExito);
                  $('.number-placeholder').html(number);
              } else if (code == 15) { // si pasaste la cantidad
                  $('#popover-form').append(mensajeExcedido);
              } else if (code >= 16 && code <= 18) {
                  $('#popover-form').append(mensajeAgendado);
                  $('p.horario').html(horarioElegido);
                  $('.number-placeholder').html(number);
              } else { //error generico
                  $('#popover-form').append(mensajeError);
                  $('#popover-form h3#mensajeError').html(number);
              }
               var delayTime = 15000;
               setTimeout(function() {
                   $("#popover-form").html("");
                   $("#popover-form").html(formPopover);
                   llamameApi.forPopover2("#llamame-pop-number0", "#llamame-pop-number1", "#number-error-pop", "#llamame-pop-schedule", "#pop-submit");
               }, delayTime);
               $(".volver-form").on("click", function() {
                   $("#popover-form").html("");
                   $("#popover-form").html(formPopover);
                   llamameApi.forPopover2("#llamame-pop-number0", "#llamame-pop-number1", "#number-error-pop", "#llamame-pop-schedule", "#pop-submit");
               })
          });
        }
    });

    
}
}

var mensajeExito =
  '          <div id="llamame-body-response-ok">' +
  '            <div class="llamame-llamando"><div></div></div>' +
  '            <label class="llamame-br-label1">Te estamos llamando</label>' +
  '            <label class="llamame-br-label2">al teléfono <span class="number-placeholder"></span></label>' +
  '            <a class="volver-form" href="javascript:void(0)">Me equivoqué de número</a>' +
  '          </div>';

var mensajeError =
  '          <div id="llamame-body-response-error">' +
  '            <span class="tpicon tpicon-informacion"></span>' +
  '            <label class="alert-msg">En este momento no podemos agendar el llamado</label>' +
  '            <p>Intentá más tarde o comunicate al</p>' +
  '            <h3 id="mensajeError"><a href=""></a></h3>' +
  '            <p>De lunes a sábado de 9 a 21</p>' +
  '          </div>';

var mensajeExcedido =
  '          <div id="llamame-body-response-exceeded">' +
  '            <label class="llamame-br-label">El número ya fue agendado</label>' +
  '            <label class="llamame-br-label2">Aguardá nuestro llamado a partir del próximo día hábil</label>' +
  '          </div>';

var mensajeAgendado =
  '          <div id="llamame-body-agendado">' +
  '            <label class="alert-msg">¡Gracias por agendar tu número!</label>' +
  '            <p style="margin:0;">Un asesor te llamará el próximo día hábil</p>' +
  '            <p class="horario"></p>' +
  '            <label class="llamame-br-label2">al teléfono <span class="number-placeholder"></span></label><br>' +
  '            <a class="volver-form" href="javascript:void(0)">Me equivoqué de número</a>' +
  '          </div>';

var oTPChat = {
  config: {
      host: "",
      path: "",
      login: 0,
      inseg: [],
      insubseg: [],
      outseg: [],
      outsubseg: [],
      days: [],
      hours: [],
      delay: 0,
      timeout: 0,
      countdown: 0,
      contactLabel: "Ayuda",
      type: 1,
      sala: "",
      internalNumberLlamame:"",
  },
  script: {
      telecom: "",
      personal: "",
      arnet: ""
  }
};

var _tpc_url = "";
var _tpc_chatTimeWaited = 0;

var _tpc_template_modal =
  '<div id="tpi-timeout-modal" class="tpi-modal-wrapper" style="display: none">' +
  '  <div class="tpi-modal modal-dialog"><div class="tpi-modal-header">' +
  '    <div class="modal-context text-center" style="border:none; border-bottom:1px solid #cccccc; box-shadow:none; padding-bottom:5px;">' +
  '      &iquest;Necesit&aacute;s chatear con un asesor?' +
  '      <div id="tpi-modal-hide" class="cerrarModal"></div>' +
  '    </div>' +
  '    <div class="tpi-modal-body" style="text-align:center;"><span>Ingresando en...</span>' +
  '      <div id="tpi-timeout-modal-countdown" style="float:none; margin:10px auto 0;"></div>' +
  '    </div>' +
  '    <div class="tpi-modal-footer" style="text-align:center;">' +
  '      <button type="button" id="tpi-timeout-btn-cancel" class="btn btn-default cerrarModal">Ahora no</button>' +
  '    </div>' +
  '  </div>' +
  '</div>';

var btn_mobile =
  '        <div id="mobile">' +
  '          <div class="mobile-icon"></div>' +
  '          <label class="mobile-label">Ayuda</label>' +
  '        </div>';
var btn_chat_s =
  '        <div id="chat" class="mobile-contacto" onclick="trackClick(\'CHAT\')">' +
  '          <div class="chat-icon"></div>' +
  '          <label class="chat-label">CHAT</label>' +
  '          <label class="chat-label3">Chatear</label>' +
  '        </div>';
var btn_chat =
  '        <div id="chat" class="mobile-contacto" onclick="trackClick(\'CHAT\')">' +
  '          <div class="chat-icon"></div>' +
  '          <label class="chat-label">Chatear</label>' +
  '        </div>';
var btn_tel =
  '        <div id="tel" class="mobile-contacto" onclick="trackClick(\'TEL\')">' +
  '          <div class="tel-icon"></div>' +
  '          <div class="tel-labels">' +
  '            <label class="tel-label1">Venta telefónica</label>' +
  '            <label class="tel-label2"><a class="telnumero" href="tel: 0800 444 4100">0800 444 4100</a></label>' +
  '            <label class="tel-label3"><a class="telnumero" href="tel: 0800 444 4100">0800 444 4100</a></label>' +
  '          </div>' +
  '        </div>';
var btn_promo =
  '        <div id="promo" class="mobile-contacto" onclick="trackClick(\'PROMO\')">' +
  '          <div class="promo-icon"></div>' +
  '          <div class="promo-labels">' +
  '            <label class="promo-label1">Exclusivo clientes</label>' +
  '            <label class="promo-label2"><a class="promonumero" href="tel: *77666">Llama al *77666</a></label>' +
  '            <label class="promo-label3"><a class="promonumero" href="tel: *77666">Clientes:<br/> *77666</a></label>' +
  '          </div>' +
  '        </div>';
var btn_llamame =
  '        <div class="llamame desktop" onclick="trackClick(\'LLAMAME\')">' +
  '          <div class="llamame-icon"></div>' +
  '          <div class="llamame-labels">' +
  '            <label class="llamame-label1">Quiero que</label>' +
  '             <label class="llamame-label2">me llamen</label>' +
  '             <div class="llamame-bullet"></div>' +
  '          </div>' +
  '           </div>' +
  '        </div>' +
  '        <div class="llamame mobile mobile-contacto" onclick="trackClick(\'LLAMAME\')">' +
  '          <div class="top">' +
  '          <div class="llamame-icon"></div>' +
  '          </div>' +
  '          <div class="llamame-labels">' +
  '            <label class="llamame-labelm">Llamame</label>' +
  '            <div class="llamame-bullet"></div>' +
  '          </div>' +
  '           </div>' +
  '        </div>';


var llamame_form =
  '        <div id="llamame-form">' +
  '          <div id="llamame-header">' +
  '            <div class="llamame-icon"></div>' +
  '            <label class="llamame-h-label">Quiero que me llamen</label>' +
  '            <div class="llamame-bullet"></div>' +
  '            <div class="close-form"></div>' +
  '          </div>' +
  '          <div id="llamame-body">' +
  '            <div class="form">' +
  '            <label class="llamame-b-label1">Ingresá tu teléfono y te llamamos gratis ahora</label><div class="clearfix"></div>' +
  '            <div class="form-group col-xs-5"><div class="input-group">' +
  '              <span class="input-group-addon">0</span>' +
  '              <input id="llamame-chat-number0" type="text" class="form-control" placeholder="11">' +
  '            </div></div>' +
  '            <div class="form-group col-xs-7"><div class="input-group">' +
  '              <span class="input-group-addon">15</span>' +
  '              <input id="llamame-chat-number1" class="form-control" type="tel" placeholder="12345678" maxlength="8">' +
  '            </div></div>' +
  '            <p id="number-error"></p>' +
  '            <label class="llamame-b-label2">¿Cúando te llamamos?</label>' +
  '            <select id="llamame-b-schedule" class="form-control">' +
  '              <option value="1" disabled selected hidden>Elegí el horario</option>'+    
  '              <option value="1">de 9 a 12hs.</option>' +
  '              <option value="2">de 12 a 16hs.</option>' +
  '              <option value="3">de 16 a 21hs.</option>' +
  '            </select>' +
  '            <button id="llamame-b-submit" class="btn btn-primary btn-block"></button>' +
  '          </div>' +
  '          </div>' +
  '          <div id="llamame-footer">' +
  '            <div class="llamame-f-icon"></div>' +
  '            <div>' +
  '            <label class="llamame-f-label1">Venta Telefónica</label>' +
  '            <label class="llamame-f-label2"><a class="llamamenumero" href=""></a></label>' +
  '            <label class="llamame-f-label4">De Lunes a Sábados de 9 a 21hs</label>' +
  '            </div>' +
  '          </div>' +
  '        </div>';

var btn_plus = '<div id="plus"><div class="plus-icon"></div></div>';
(function($) {
  $.fn.textfill = function(maxFontSize) {
      maxFontSize = parseInt(maxFontSize, 10);
      return this.each(function() {
          var ourText = $(this),
              parent = ourText.parent().parent(),
              maxWidth = parent.width() - 25,
              fontSize = parseInt(ourText.css("fontSize"), 10),
              multiplier = maxWidth / ourText.width(),
              newSize = (fontSize * (multiplier - 0.1));
          ourText.css("fontSize", (maxFontSize > 0 && newSize > maxFontSize) ? maxFontSize : newSize);
      });
  };
})(jQuery);

/*function adjustFonts() {
  setTimeout(function() {
      $('.tel-label1').textfill(12);
      $('.tel-label2').textfill(16);
      $('.promo-label1').textfill(12);
      $('.promo-label2').textfill(13);
  }, 100);
}
adjustFonts();

$(window).resize(function() { adjustFonts(); });*/

function log(msg) {
  //if (oTPInjector.env.name != 'PROD') console.log(msg);
}

function _tpc_validateShowChat() {
    //requiere login y no esta logueado
    if (oTPChat.config.login == 1 && !oTPInjector.user.login) { log('requiere login y no esta logueado'); return false; }

    //si el usr esta logueado, verifico los sub/segmentos que posee con los que hay que in/excluir
    if (oTPInjector.user.login) {
        //hay seg a incluir y el user no los tiene
        if (oTPChat.config.inseg.length > 0 && oTPChat.config.inseg.indexOf(oTPInjector.user.segmento) == -1) { log('el usr no posee el segmento a incluir'); return false; }
        //hay subseg a incluir y el user no los tiene
        if (oTPChat.config.insubseg.length > 0 && oTPChat.config.insubseg.indexOf(oTPInjector.user.subsegmento) == -1) { log('el usr no posee el subsegmento a incluir'); return false; }
        //hay seg a excluir y el user los tiene
        if (oTPChat.config.outseg.length > 0 && oTPChat.config.outseg.indexOf(oTPInjector.user.segmento) > -1) { log('el usr posee el segmento a excluir'); return false; }
        //hay subseg a exluir y el user los tiene
        if (oTPChat.config.outsubseg.length > 0 && oTPChat.config.outsubseg.indexOf(oTPInjector.user.subsegmento) > -1) { log('el usr posee el subsegmento a excluir'); return false; }
    }

    // el dia actual esta incluido en los definidos?
    var sHora = oTPInjector.env.date.getHours().toString(),
        sDia = oTPInjector.env.date.getDay().toString();
    if (oTPChat.config.days.length > 0 && oTPChat.config.days.indexOf(sDia) == -1) { log('no es el dia adecuado'); return false; }
    // la hora actual esta incluido en los definidos?
    if (oTPChat.config.hours.length > 0 && oTPChat.config.hours.indexOf(sHora) == -1) { log('no es la hora adecuada'); return false; }

    
    return true;
}

function customizarBotones() {
  if (oTPChat.config.contactLabelColor) { $('#mobile').attr('style', ' background-color: ' + oTPChat.config.contactLabelColor); }
  if (oTPChat.config.contactLabelIcono) { $('.mobile-icon').attr("src", oTPInjector.env.urlWebResources + "/images/tpchat/" + oTPChat.config.contactLabelIcono); }

  if (oTPChat.config.showChatColor) { $('#chat').attr('style', ' background-color: ' + oTPChat.config.showChatColor); }
  if (oTPChat.config.showChatIcono) { $('.chat-icon').css("background-image", "url('" + oTPInjector.env.urlWebResources + "/images/tpchat/" + oTPChat.config.showChatIcono + "')"); }
  if (oTPChat.config.showChatTexto1) { $('.chat-label, .chat-label3').html(oTPChat.config.showChatTexto1); }

  if (oTPChat.config.showTelColor) { $('#tel').attr('style', ' background-color: ' + oTPChat.config.showTelColor); }
  if (oTPChat.config.showTelIcono) { $('.tel-icon').css("background-image", "url('" + oTPInjector.env.urlWebResources + "/images/tpchat/" + oTPChat.config.showTelIcono + "')"); }
  if (oTPChat.config.showTelTexto1) { $('.tel-label1').html(oTPChat.config.showTelTexto1); }
  if (oTPChat.config.showTelTexto2) { $('.tel-label2').html(oTPChat.config.showTelTexto2); }
  if (oTPChat.config.showTelTexto2) { $('.telnumero').attr("href", "tel:" + oTPChat.config.showTelTexto2.replace(/ /g, '')); }

  if (oTPChat.config.showPromoColor) { $('#promo').attr('style', ' background-color: ' + oTPChat.config.showPromoColor) };
  if (oTPChat.config.showPromoIcono) { $('.promo-icon').css("background-image", "url('" + oTPInjector.env.urlWebResources + "/images/tpchat/" + oTPChat.config.showPromoIcono + "')"); }
  if (oTPChat.config.showPromoTexto1) { $('.promo-label1').html(oTPChat.config.showPromoTexto1); }
  if (oTPChat.config.showPromoTexto2) { $('.promo-label2').html("Llamá al " + oTPChat.config.showPromoTexto2); }
  if (oTPChat.config.showPromoTexto2) { $('.promonumero').attr("href", "tel:" + oTPChat.config.showPromoTexto2.replace(/ /g, '')); }

  if (oTPChat.config.showLlamameColor) { $('.llamame').attr('style', ' background-color: ' + oTPChat.config.showLlamameColor) };
  if (oTPChat.config.showLlamameIcono) { $('.llamame-icon').css("background-image", "url('" + oTPInjector.env.urlWebResources + "/images/tpchat/" + oTPChat.config.showLlamameIcono + "')"); }
  if (oTPChat.config.showLlamameTexto1) { $('.llamame-label1').html(oTPChat.config.showLlamameTexto1); }
  if (oTPChat.config.showLlamameTexto2) { $('.llamame-label2').html(oTPChat.config.showLlamameTexto2); }
  if (oTPChat.config.showLlamameTexto2) { $('.llamame-labelm').html(oTPChat.config.showLlamameTexto2); }
}

function mostrarBotonera() {
  $("#botonera").css("display", "block");
  if ('undefined' !== typeof dataLayer) {
      if (oTPChat.config.showChat) {
          if (oTPChat.config.type == 2) {
              dataLayer.push({ 'event': 'trackEvent', 'eventCategory': 'Btn Acc', 'eventAction': 'Impresion ChatBot', 'eventLabel': oTPInjector.config.appName });
          } else {
              dataLayer.push({ 'event': 'trackEvent', 'eventCategory': 'Btn Acc', 'eventAction': 'Impresion Chat Epiron', 'eventLabel': oTPInjector.config.appName });
          }
      } else if (oTPChat.config.showPromo) {
          dataLayer.push({ 'event': 'trackEvent', 'eventCategory': 'Btn Acc', 'eventAction': 'Impresion *Promo', 'eventLabel': oTPInjector.config.appName });
      } else if (oTPChat.config.showTel) {
          dataLayer.push({ 'event': 'trackEvent', 'eventCategory': 'Btn Acc', 'eventAction': 'Impresion Vta Telefonica', 'eventLabel': oTPInjector.config.appName });
      } else if (oTPChat.config.showLlamame) {
          dataLayer.push({ 'event': 'trackEvent', 'eventCategory': 'Btn Acc', 'eventAction': 'Impresion Llamame', 'eventLabel': oTPInjector.config.appName });
      }
  }
/*  adjustFonts();*/
}

function trackClick(caller) {
  if ('undefined' !== typeof dataLayer) {
      if ('CHAT' == caller) {
          if (oTPChat.config.type == 2) {
              dataLayer.push({ 'event': 'trackEvent', 'eventCategory': 'Btn Acc', 'eventAction': 'Click ChatBot', 'eventLabel': oTPInjector.config.appName });
          } else {
              dataLayer.push({ 'event': 'trackEvent', 'eventCategory': 'Btn Acc', 'eventAction': 'Click Chat Epiron', 'eventLabel': oTPInjector.config.appName });
          }
      } else if ('PROMO' == caller) {
          dataLayer.push({ 'event': 'trackEvent', 'eventCategory': 'Btn Acc', 'eventAction': 'Click *Promo', 'eventLabel': oTPInjector.config.appName });
      } else if ('TEL' == caller) {
          dataLayer.push({ 'event': 'trackEvent', 'eventCategory': 'Btn Acc', 'eventAction': 'Click Vta Telefonica', 'eventLabel': oTPInjector.config.appName });
      } else if ('LLAMAME' == caller) {
          dataLayer.push({ 'event': 'trackEvent', 'eventCategory': 'Btn Acc', 'eventAction': 'Click Llamame', 'eventLabel': oTPInjector.config.appName });
      }
  }
  return false;
}

function configurarTimer() {
  //si tengo los dos valores basicos para el timer, lo programo
  if (oTPChat.config.delayespera && oTPChat.config.timeout) {
      var _tpc_chatTimer = setInterval(function() {
          //esta funcion se llama cada oTPChat.config.delayespera millis, entonces sumo esa cantidad
          _tpc_chatTimeWaited = _tpc_chatTimeWaited + (oTPChat.config.delayespera / 1000); //sumo segundos
          //si lo que ya espere es igual a lo que tenia por config, muestro
          if (_tpc_chatTimeWaited >= oTPChat.config.timeout) {
              mostrarBotonera();
              clearInterval(_tpc_chatTimer);
          }
      }, oTPChat.config.delayespera);
  } else {
      //si no timer ni tengo countdown, lo muestro de una...
      mostrarBotonera();
  }
}

function abrirEpironChat() {
  window.open(_tpc_url, '_blank', 'toolbar=0,location=0,menubar=0');
}

function clickEventEpironChat() {
  if (!oTPChat.config.countdown) {
      abrirEpironChat();
  } else {
      var _tpc_timeoutCountdown = oTPChat.config.countdown;

      //incluyo el chat modal
      $('body').append(_tpc_template_modal);

      $('#tpi-timeout-modal-countdown').html(_tpc_timeoutCountdown);
      $("#tpi-timeout-modal").show();
      var _tpc_chatCountdownTimer = setInterval(function() {
          //esta function se llama cada oTPChat.config.delayespera millis, asi que eso le resto
          _tpc_timeoutCountdown -= 1; //resto segundos
          $('#tpi-timeout-modal-countdown').html(_tpc_timeoutCountdown); //actualizo la cta regresiva en la modal
          //si llego a cero muestro
          if (_tpc_timeoutCountdown <= 0) {
              clearInterval(_tpc_chatCountdownTimer);
              $('#tpi-timeout-modal').hide();
              _tpc_timeoutCountdown = oTPChat.config.countdown;
              abrirEpironChat();
          }
      }, 1000);

      $(".cerrarModal").on("click", function() {
          clearInterval(_tpc_chatCountdownTimer);
          $('#tpi-timeout-modal').hide();
      });


  }
}

function configurarTipoChat(flag) {
  var selector;
  if(flag){ //Mobile way displayed
      selector = $('#botonera');
  }else{ //Not mobile way displayed
      selector = $('#chat');
  }
  if (oTPChat.config.type == 2) {
      _tpc_url = "javascript:void(0)";//si el chat es agentbot, le pongo el laucher
      selector.addClass('agent-launcher');
  } else {
      if (oTPChat.config.type == 0) {
          _tpc_url = "https://personalchat.epiron.com.ar/Chat/Index";
      }
      if (oTPChat.config.type == 1) {
          _tpc_url = "http://telecomchat.epiron.com.ar/Chat/chatingreso";
      }
      if (oTPChat.config.type == 0 || oTPChat.config.type == 1) {
          _tpc_url += oTPChat.config.sala ? "?salaId=" + oTPChat.config.sala : "";
          if (oTPInjector.user.login) {
              _tpc_url += (_tpc_url.indexOf('?') != -1 ? "&" : "?") + "tel=" + oTPInjector.user.line + "&clientName=" + encodeURIComponent(oTPInjector.user.name) + "&email=" + encodeURIComponent(oTPInjector.user.email) + "&query=Consulta Web Personal";
          }
          selector.click(function() { clickEventEpironChat() });
      }
  }
}
function openLLamameForm(){
  if ($('#mobile').is(':visible')) {
      $('#mobile').addClass('restore').hide();
      var alturaPantalla = screen.height;
      $("#llamame-form #llamame-body").height(alturaPantalla - 235);
  }
  $('#botonera').fadeOut('fast');
  var internalNumberLlamame= oTPChat.config.internalNumberLlamame;
  $('.llamamenumero').html("LLamá al "+internalNumberLlamame);
  $('.llamamenumero').attr("href", "tel:"+internalNumberLlamame);
  $('#llamame-form').show();
  $('#llamame-form').animate({
      bottom: 0
  });
  llamameApi.forChat("#llamame-chat-number0", "#llamame-chat-number1", "#number-error", "#llamame-b-schedule", "#llamame-b-submit");
}
function armarTemplate() {

  //agrego css
  var oCssElement = document.createElement('link');
  oCssElement.type = 'text/css';
  oCssElement.rel = 'stylesheet';
  oCssElement.href = oTPInjector.env.urlWebResources + '/components/tpchat/' + oTPChat.config.tipoBotonera + '.css';
  document.body.appendChild(oCssElement);

  var _tpc_oContactBox = document.createElement('div');
  _tpc_oContactBox.id = 'botonera';
  _tpc_oContactBox.style.display = "none";
  document.body.insertBefore(_tpc_oContactBox, null);

  //agrego template
  switch (oTPChat.config.tipoBotonera) {
      case 'tpchatc1':
          $("#botonera").append(btn_mobile + btn_chat); //chat
          break;
      case 'tpchatc2':
          $("#botonera").append(btn_mobile + btn_tel); //tel
          break;
      case 'tpchatc3':
          $("#botonera").append(btn_mobile + btn_promo); //promo
          break;
      case 'tpchatc4':
          $("#botonera").append(btn_mobile + btn_chat_s + btn_tel); //chat tel
          break;
      case 'tpchatc5':
          $("#botonera").append(btn_mobile + btn_chat_s + btn_promo); //chat promo
          break;
      case 'tpchatc6':
          $("#botonera").append(btn_mobile + btn_chat_s + btn_tel + btn_plus + btn_promo); //chat tel promo
          break;
      case 'tpchatc7':
          $("#botonera").append(btn_mobile + btn_chat_s + btn_promo + btn_plus + btn_tel); //chat promo tel
          break;
      case 'tpchatc8':
          $("#botonera").append(btn_mobile + btn_tel + btn_plus + btn_promo); //tel promo
          break;
      case 'tpchatc9':
          $("#botonera").append(btn_mobile + btn_promo + btn_plus + btn_tel); //promo tel
          break;
      case 'tpchatc10':
          $("#botonera").append(btn_mobile + btn_llamame); //llamame
          $("body").append(llamame_form); 
          break;
      case 'tpchatc11':
          $("#botonera").append(btn_mobile + btn_chat_s + btn_llamame); //chat llamame
          $("body").append(llamame_form); 
          break;
  }

  //customizo el placeholder del chat mobile
  $(".mobile-label").text(oTPChat.config.contactLabel);
  
  $("#mobile").click(function() {
      if (oTPChat.config.showLlamame==1 && oTPChat.config.showPromo==0 && oTPChat.config.showChat==0 && oTPChat.config.showTel==0 && oTPChat.config.showTel==0){ // Case which only Llamame's displayed
          openLLamameForm();
      }else if(oTPChat.config.showChat==1 && oTPChat.config.showLlamame==0 && oTPChat.config.showPromo==0 && oTPChat.config.showTel==0 && oTPChat.config.showTel==0){ // Case which only Chat's displayed
         configurarTipoChat(true); 
      }else{
          var anchoContacto = $(".mobile-contacto").css("width");
          var paddingContacto = $(".mobile-contacto").css("padding");
          $(".mobile-contacto label,.mobile-contacto label a").css("color", "transparent");
          if ($(this).width() > 20) {
              $(".mobile-contacto").css("width", "0");
              $(".mobile-contacto").css("padding", "0");
              $(".mobile-icon").css("background-image", "url('" + oTPInjector.env.urlWebResources + "/images/icons/flecha-der.png')");
              $(".mobile-label").hide();
              $(this).animate({ width: "20px" });
              $(".mobile-icon").animate({ width: "7px", margin: "25px -2px 0" });
              $(".mobile-contacto").show();
              $(".mobile-contacto").animate({ width: anchoContacto, padding: paddingContacto });
              setTimeout(function() {
                  $(".mobile-contacto label,.mobile-contacto label a").css("color", "#FFFFFF");
              }, 500);
          } else {
              $(".mobile-icon").css("background-image", "url('" + oTPInjector.env.urlWebResources + "/images/tpchat/ayuda-venta.png')");
              $(this).animate({ width: "50px" });
              $(".mobile-label").fadeIn('fast');
              $(".mobile-icon").animate({ width: "25px", margin: "5px 2px" });
              $(".mobile-contacto").animate({ width: "0px", padding: "0" });
              setTimeout(function() {
                  $(".mobile-contacto").hide();
                  $(".mobile-contacto").css("width", anchoContacto);
                  $(".mobile-contacto").css("padding", paddingContacto);
              }, 500);
          }
      }
  });

  $('#plus').click(function() {
      if (!$('#promo').is(':visible')) {
          $('#promo').fadeIn('slow');
          $('#promo').addClass('displayed');
      } else {
          if ($('#promo').hasClass('displayed')) {
              $('#promo').fadeOut('slow');
          }
      }
      if (!$('#tel').is(':visible')) {
          $('#tel').fadeIn('slow');
          $('#tel').addClass('displayed');
      } else {
          if ($('#tel').hasClass('displayed')) {
              $('#tel').fadeOut('slow');
          }
      }
  });

  if (oTPChat.config.showLlamame) {
      var onTime = llamameApi._validTimeLlamame();
      setTimeout(function() {
          if (onTime) {
              $('.llamame-b-label2').hide();
              $('#llamame-body select').hide();
              $('.llamame-bullet').addClass('green');
              $('.llamame-web-online').show();
              $('p.available').show();
              $('#llamame-b-submit').html("LLAMAME AHORA");
          } else {
              $('#llamameModal p.not-available').show();
              $('.llamame-bullet').addClass('grey');
              $('#llamameModal .llamame-web-offline').show();
              $('#llamame-b-submit').html("AGENDAR LLAMADO");
          }
      }, 1000);

      $('.llamame').click(function() {
          openLLamameForm();
      });

      $('.close-form, #button-cerrar-modal').click(function() {
          if (_tpi_isResponsive) { //Mobile case
              $('#mobile.restore').removeClass('restore').show();
              $('#llamame-form').hide();
              $('#botonera').show();
          } else {
              $('#llamame-form').animate({
                  bottom: '-70%'
              });
              $('#llamame-form').fadeOut();
              $('#botonera').fadeIn(1000);
            }
      });
  }
}

function _tpc_initChat() {
  armarTemplate();
  

  //defino si incluto bot o chat
  configurarTipoChat(false);

  //personalizo textos, iconos y colores de los botons
  customizarBotones();

  //valido condiciones y si esta ok muestro el chat/activo el timer
  if (_tpc_validateShowChat()) {
      //incluyo un timer para el chat si corresponde
      configurarTimer();
  }
}

function _tpc_initConfig() {
  var path = "";
  if (oTPInjector.env.urlWebResources == "//resourcesdev.personal.com.ar") {
      path = "/components/tpchat/config.txt";
  } else {
    path = "/data/tpchat/config.txt"; 
  }
  $.get(oTPInjector.env.urlWebResources + path, function(data) { //Get config.tx variables
      var all_config = data.split("\n");
      var _tpc_foundConfig = false;

      for (var siteConfig = 0; siteConfig < all_config.length; siteConfig++) {
          _tpc_foundConfig = false;
          if (!all_config[siteConfig].startsWith("//") && all_config[siteConfig] != "") {
              //log('*' + all_config[siteConfig] + '*');
              var this_config = all_config[siteConfig].split("|");
              if (this_config[20] == 1) { //si esta config esta activa, la leo
                  // If tiene chanchullo
                  if (this_config[0] == '@resources') {
                      this_config[0] = oTPInjector.env.urlWebResources.replace('//', '');
                  }

                  if (_tpi_location.hostname == this_config[0]) {
                      //estoy en el host, encontre
                      _tpc_foundConfig = true;
                      //si tengo un path lo chequeo
                      if (this_config[1] != "") {
                          var sPath = "/" + this_config[1];
                          _tpc_foundConfig = _tpi_location.pathname.startsWith(sPath);

                          //si el path no coincidio, agrego el hash y vuelvo a chequear para dar soporte a las apps angular que usan el #
                          if (!_tpc_foundConfig) {
                              var fullPath = _tpi_location.pathname + _tpi_location.hash;
                              _tpc_foundConfig = fullPath.startsWith(sPath);
                          }
                      }

                      //si encontre la regla, reviso que tenga el login correcto 
                      if (_tpc_foundConfig) {
                          // Si regla requiere login
                          if (parseInt(this_config[2]) == 1) {
                              //regla requiere login, si usr esta logueado, encontr, sino, no encontre
                              _tpc_foundConfig = oTPInjector.user.login == true;
                          } else { // Si regla no requiere login o es indistinto, es este
                              _tpc_foundConfig = true;
                          }
                      }
                      if (_tpc_foundConfig) {
                          oTPChat.config.host = this_config[0];
                          oTPChat.config.path = this_config[1];
                          oTPChat.config.login = parseInt(this_config[2]); // 0 indistinto, 1 logueado, 2 anonimo

                          oTPChat.config.inseg = this_config[3] != "" ? this_config[3].split(",") : [];
                          oTPChat.config.insubseg = this_config[4] != "" ? this_config[4].split(",") : [];
                          oTPChat.config.outseg = this_config[5] != "" ? this_config[5].split(",") : [];
                          oTPChat.config.outsubseg = this_config[6] != "" ? this_config[6].split(",") : [];

                          oTPChat.config.days = this_config[7] != "" ? this_config[7].split(",") : [];
                          oTPChat.config.hours = this_config[8] != "" ? this_config[8].split(",") : [];

                          oTPChat.config.delayespera = parseInt(this_config[9] * 1000); //segundos, convertido a millis
                          oTPChat.config.timeout = parseInt(this_config[10] * 1); //segundos de espera
                          oTPChat.config.countdown = parseInt(this_config[11] * 1); //segundos de countdown para modal

                          oTPChat.config.type = parseInt(this_config[13]); // 0 chat, 1 ibot
                          oTPChat.config.sala = this_config[14]; // idSala solo si es chat

                          oTPChat.config.showChat = parseInt(this_config[15]); // muestro el boton de chat
                          oTPChat.config.showPromo = parseInt(this_config[16]); // muestro el boton de promo
                          oTPChat.config.showTel = parseInt(this_config[17]); // muestro el boton de tel
                          oTPChat.config.priorizePromo = parseInt(this_config[18]); // viene promo-tel o tel-promo

                          oTPChat.config.showLlamame = parseInt(this_config[34]); // muestro el boton de llamame

                          //segun la combinacion de botones que se configuro, defino la configuracion de la botonera
                          if (!oTPChat.config.showLlamame) {
                              if (oTPChat.config.showChat && !oTPChat.config.showPromo && !oTPChat.config.showTel) {
                                  oTPChat.config.tipoBotonera = "tpchatc1"; // chat
                              } else if (!oTPChat.config.showChat && !oTPChat.config.showPromo && oTPChat.config.showTel) {
                                  oTPChat.config.tipoBotonera = "tpchatc2"; // tel
                              } else if (!oTPChat.config.showChat && oTPChat.config.showPromo && !oTPChat.config.showTel) {
                                  oTPChat.config.tipoBotonera = "tpchatc3"; // promo
                              } else if (oTPChat.config.showChat && !oTPChat.config.showPromo && oTPChat.config.showTel) {
                                  oTPChat.config.tipoBotonera = "tpchatc4"; // chat tel
                              } else if (oTPChat.config.showChat && oTPChat.config.showPromo && !oTPChat.config.showTel) {
                                  oTPChat.config.tipoBotonera = "tpchatc5"; // chat promo
                              } else if (oTPChat.config.showChat && oTPChat.config.showPromo && oTPChat.config.showTel && !oTPChat.config.priorizePromo) {
                                  oTPChat.config.tipoBotonera = "tpchatc6"; // chat tel promo
                              } else if (oTPChat.config.showChat && oTPChat.config.showPromo && oTPChat.config.showTel && oTPChat.config.priorizePromo) {
                                  oTPChat.config.tipoBotonera = "tpchatc7"; // chat promo tel
                              } else if (!oTPChat.config.showChat && oTPChat.config.showPromo && oTPChat.config.showTel && !oTPChat.config.priorizePromo) {
                                  oTPChat.config.tipoBotonera = "tpchatc8"; // tel promo
                              } else if (!oTPChat.config.showChat && oTPChat.config.showPromo && oTPChat.config.showTel && oTPChat.config.priorizePromo) {
                                  oTPChat.config.tipoBotonera = "tpchatc9"; // promo tel
                              }
                          } else {
                              if (oTPChat.config.showLlamame && !oTPChat.config.showChat && !oTPChat.config.showPromo && !oTPChat.config.showTel) {
                                  oTPChat.config.tipoBotonera = "tpchatc10"; // llamame                                    
                              } else if (oTPChat.config.showLlamame && oTPChat.config.showChat && !oTPChat.config.showPromo && !oTPChat.config.showTel) {
                                  oTPChat.config.tipoBotonera = "tpchatc11"; // chat llamame                                    
                              }
                          }

                          oTPChat.config.alias = this_config[19]; // alias de la configuracion
                          oTPChat.config.status = parseInt(this_config[20]); // activa o inactiva

                          oTPChat.config.showChatTexto1 = this_config[21];
                          oTPChat.config.showChatIcono = this_config[22]; // icono del boton de chat
                          oTPChat.config.showChatColor = this_config[23]; // color de fondo del boton de chat

                          oTPChat.config.showPromoTexto1 = this_config[24];
                          oTPChat.config.showPromoTexto2 = this_config[25];
                          oTPChat.config.showPromoIcono = this_config[26]; // icono del boton de promo
                          oTPChat.config.showPromoColor = this_config[27]; // color de fondo del boton de promo

                          oTPChat.config.showTelTexto1 = this_config[28];
                          oTPChat.config.showTelTexto2 = this_config[29];
                          oTPChat.config.showTelIcono = this_config[30]; // icono del boton de tel
                          oTPChat.config.showTelColor = this_config[31]; // color de fondo del boton de tel

                          oTPChat.config.showLlamameTexto1 = this_config[35];
                          oTPChat.config.showLlamameTexto2 = this_config[36];
                          oTPChat.config.showLlamameIcono = this_config[37]; // icono del boton de llamame
                          oTPChat.config.showLlamameColor = this_config[38]; // color de fondo del boton de llamame
                          oTPChat.config.internalNumberLlamame = this_config[39]; // Internal number llamame

                          oTPChat.config.contactLabel = this_config[12] != "" ? this_config[12] : "Venta";
                          oTPChat.config.contactLabelColor = this_config[32]; // color de fondo del boton de etiqueta
                          oTPChat.config.contactLabelIcono = $.trim(this_config[33]); // icono del boton de etiqueta
                          _tpc_initChat();
                          return true;
                      }
                  } else {
                      log('la config ' + this_config[19] + ' no coincide');
                  }
              } else {
                  log('la config ' + this_config[19] + ' no esta activa');
              }
          } else if (all_config[siteConfig].startsWith("//") && all_config[siteConfig].contains("|")) {
              var script_config = all_config[siteConfig].replace('//', '').split("|");
              var oAgentBot = document.createElement('script');
              oAgentBot.type = 'text/javascript';
              oAgentBot.async = true;
              if (script_config[0].contains("Personal") && _tpi_location.host.contains("personal")) {
                  var agentBotParams = "?token=a6bb29bb6c6c81a40f019c9467b64b0c.ed5e78b542cb14c41c3700be92cfe99b" +
                      "&conditions=[{'UnidadDeNegocio':'160'}]" +
                      "&tab=false" +
                      "&logged=" + oTPInjector.user.login +
                      "&DatosLineaMercado=" + oTPInjector.user.mercado +
                      "&DatosLineaPlan=" + encodeURIComponent(oTPInjector.user.plan);
                  oAgentBot.src = script_config[1] + agentBotParams;
                  document.body.appendChild(oAgentBot);
              } else if (script_config[0].contains("Telecom") && _tpi_location.host.contains("telecom")) {
                  oAgentBot.src = script_config[1];
                  document.body.appendChild(oAgentBot);
              } else if (script_config[0].contains("Arnet") && _tpi_location.host.contains("arnet")) {
                  oAgentBot.src = script_config[1];
                  document.body.appendChild(oAgentBot);
              } 
          }
      }
  });
}
var oAgentBot=document.createElement("script");oAgentBot.type="text/javascript";oAgentBot.async=true;if(_tpi_location.host.contains("personal")){var agentBotParams="?token=a6bb29bb6c6c81a40f019c9467b64b0c.ed5e78b542cb14c41c3700be92cfe99b"+"&conditions=[{'UnidadDeNegocio':'160'}]"+"&tab=false"+"&logged="+oTPInjector.user.login+"&DatosLineaMercado="+oTPInjector.user.mercado+"&DatosLineaPlan="+encodeURIComponent(oTPInjector.user.plan);oAgentBot.src="https://cdn.agentbot.net/core/b14b275483a2be9941845caee78cc7cb.js"+agentBotParams}else if(_tpi_location.host.contains("arnet")||_tpi_location.host.contains("telecom")){oAgentBot.src="https://cdn.agentbot.net/core/a3ec34dc22fc4b43ac92191d3d05f727.js"}document.body.appendChild(oAgentBot);
_tpc_initConfig();

function _tpc_initLlamameModal() {
  $('#llamame-modal').each(function() {
      llamameApi.forModal($(this), "#llamame-modal-number0", "#llamame-modal-number1", "#number-error-modal", "#llamame-modal-schedule", "#modal-b-submit");
      $("#llamame-button-1").on("click", function() {
          $("#button-llamame-modal").click();
      })

      $("#llamameModal button.close").on("click", function() {
        $("p#number-error-modal").hide();
        $("input#llamame-modal-number1,input#llamame-modal-number0").css("border","1px solid #cccccc");
      })
  });
}

function _tpc_initLlamameCore() {
  $('#llamame-core').each(function() {
      llamameApi.forCore($(this), "#llamame-core-number0", "#llamame-core-number1", "#number-error-core", "#llamame-core-schedule", "#llamame-core-submit");

  });
}

function _tpc_initLlamamePopover() {
  $('#llamame-popover').each(function() {
      llamameApi.forPopover($(this), "#llamame-pop-number0", "#llamame-pop-number1", "#number-error-pop", "#llamame-pop-schedule", "#pop-submit");
  });
}

function _tpc_initLlamameBanner() {
  setTimeout(function () {
  $('.swiper-slide #llamame-banner').not('.swiper-slide-duplicate #llamame-banner').each(function() {
      llamameApi.forBanner($(this), '#llamame-banner-number0','#llamame-banner-number1', '#callme-submit', '#callme-msg');
  });
}, 1000);
}

_tpc_initLlamameModal();

_tpc_initLlamameCore();

_tpc_initLlamamePopover();

_tpc_initLlamameBanner();
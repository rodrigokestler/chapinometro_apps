/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var user = {
    correo :'',
    password :'',
nombre: '',
vidas: 5,
sonidos:true,
getVidas: function(tipo='resume'){
    
    var data = {
    user_email: user.correo,
    user_pass: user.password,
    action: 'get_user_vidas',
    tipo: tipo
        
    };
    console.log(JSON.stringify(data));
    $.ajax({
           url:app.url_ajax,
           dataType: 'json',
           data: data,
           type: 'post',
           timeout: 15000,
           
           error: function(a,b,c){
           console.log('error '+JSON.stringify(a)+JSON.stringify(b));
           },
           success: function(a){
           console.log(JSON.stringify(a));
           if(a.msj_error === undefined && a.success==='1'){
           user.vidas = a.vidas;
           if(tipo=='reset'){
           user.vidas = 5;
           }
           niveles.vidas.html(user.vidas);
           
           }else{
           
           }
           
           },
           complete: function(){
           
           
           }
           
           });
},
setPushes:function(){
    pushNotification.register(
                              user.successHandler,
                              user.errorHandler,
                              {
                              "senderID":app.pushID,
                              "ecb":"user.onNotification"
                              });
    
},
successHandler:function(e){
    
},
errorHandler:function(e){
    
},
onNotification:function(e){
    console.log(e.regid);
    console.log(e.event);
    switch(e.event){
        case 'registered':
            $.ajax({
                   url:app.url_ajax,
                   dataType: 'text',
                   data: {
                   action:'save_user_token',
                   user_token:e.regid,
                   user_email: user.correo,
                  	user_pass: user.password,
                   },
                   type: 'post',
                   timeout: 15000,
                   error: function(a,b,c){
                   console.log('fail registered token');
                   },
                   success: function(a){
                   console.log('success registered token');
                   }
                   });
            break;
        case 'message':
            break;
        case 'error':
            break;
    }
},
    
    
    initialize : function(){
        user.recordarPassword = 'true';
        console.log(user.recordarPassword);
        user.correo = window.localStorage.getItem('correo');
        console.log(user.correo);
        user.password = window.localStorage.getItem('password');
        console.log(user.password);
        
        if(window.localStorage.getItem('sonidos') == 'false'){
            user.sonidos = false;
            app.sonidosBtn.addClass('sonido_off');
        }else{
            user.sonidos= true;
            app.sonidosBtn.addClass('sonido_on');
        }
        
        if(user.recordarPassword != '' &&  user.correo != '' && user.password != '' && user.recordarPassword ==='true'){
            
            if(user.correo !==null && user.password !==null && (user.correo !== user.password && (isNaN(user.correo) && isNaN(user.password)))){
                //loginScreen.loginPantalla.hide();
                
                console.log('entro login normal');
                $('#loginEmail').val(user.correo);
                $('#loginPassword').val(user.password);
                loginScreen.loginButton.click();
                
            }else if(user.correo === user.password && !isNaN(user.correo) && !isNaN(user.password) && user.correo!=null && user.password!=null){
                fb.login();
            }
        }
        
    },
    setProps : function(correo, password){
        user.correo = correo;
        user.password = password;
        window.localStorage.setItem('correo',correo);
        window.localStorage.setItem('password',password);
        window.localStorage.setItem('recordarPassword','true');
    },
logout: function(){
    window.localStorage.setItem('correo','');
    window.localStorage.setItem('password','');
    app.history = [];
    menuScreen.menu.hide();
    loginScreen.loginPantalla.show();
}
};

var myModal = {
    modal : $('#myModal'),
    modalHeader : $('#myModalHeader'),
    modalBody : $('#myModalBody'),
    open : function(header, body){
        myModal.modalHeader.html(header);
        myModal.modalBody.html(body);
        myModal.modal.modal();
    }
};
var popup = {
salirNivel: {
screen:$('#salirNivelPopup')
}
};

var registerScreen = {
    registerPantalla : $('#register_screen'),
    registerForm : $('#registerForm'),
    registerButton : $('#registerButton'),
pass1: $('#registerPass1'),
pass2: $('#registerPass2'),
success: false,
loadScreenEvents: function(){
    $('#registerForm input[type="text"]').focusin(function(){
                                                  registerScreen.registerPantalla.find('.container').scrollTo(this);
                                                  });
    registerScreen.registerForm.parsley().on('form:success',function(){
                                             registerScreen.success = true;
                                             registerScreen.registerButton.append(app.loader);
                                             registerScreen.registerButton.prop('disabled',true);
                                             console.log('success form parsley');
                                             });
    registerScreen.registerForm.parsley().on('form:submit',function(){
                                             console.log('register');
                                             if(registerScreen.success){
                                             registerScreen.success = false;
                                             if(registerScreen.pass1.val()===registerScreen.pass2.val()){
                                             var formData = registerScreen.registerForm.getFormData();
                                             
                                             console.log(JSON.stringify(formData));
                                             formData.action = 'register_user';
                                             registerScreen.register(formData);
                                             }else{
                                             
                                             myModal.open('Lo sentimos &#x1F61E;','Tus contrase&ntilde;as deben de ser las mismas');
                                             
                                             registerScreen.registerButton.prop('disabled',false);
                                             registerScreen.registerButton.html('ENTRAR');
                                             }
                                             }
                                             return false;
                                             });
    registerScreen.registerForm.parsley().on('form:error',function(){
                                            myModal.open('Lo sentimos &#x1F61E;','Tu nombre de usuario solo puede contener letras y/o números');
    });
},
clean: function(){
    $(':input','#registerForm')
    .not(':button, :submit, :reset, :hidden')
    .val('')
    .removeAttr('checked')
    .removeAttr('selected');
},
    register : function(formDataRegister){
        formDataRegister.user_email += '@chapinometro.com';
        console.log(JSON.stringify(formDataRegister));
        
        
        $.ajax({
               url:app.url_ajax,
               dataType: 'json',
               data: formDataRegister,
               type: 'post',
               timeout: 15000,
               // processData : false,
               // contentType: false,
               error: function(a,b,c){
               console.log('error '+JSON.stringify(a)+JSON.stringify(b));
               },
               success: function(a){
               console.log(JSON.stringify(a));
               
               if(a.msj_error === undefined && a.success==='1'){
               user.setProps(formDataRegister.user_email,formDataRegister.user_pass1);
               user.vidas = 5;
               niveles.vidas.html(user.vidas);
               registerScreen.registerPantalla.hide('slide',{direction:'left'},'fast');
               niveles.getNiveles();
               registerScreen.clean();
               loginScreen.loginPantalla.hide();
               clevertap.profile.push({
                                      "Site": {
                                      "Email": ""+formDataRegister.user_email, // User's name
                                      "mail": ""+formDataRegister.user_email, // User's name
                                      "Identity": a.ID,
                                      "platform": ""+device.platform,
                                      "model": ""+device.model
                                      }
                                      });
               clevertap.event.push("Register");
               
               }else{
               myModal.open('Error',a.msj_error);
               
               
               }
               },
               complete: function(){
               registerScreen.registerButton.prop('disabled',false);
               registerScreen.registerButton.html('ENTRAR');
               
               }
               
               });
    }
};
var loginScreen = {
    loginPantalla : $('#login_screen'),
    loginForm : $('#loginForm'),
    loginButton : $('#loginButton'),
    recordarPassword : $('#rememberPassword'),
success:false,
loadScreenEvents: function(){
    $('#loginForm input[type="text"]').focusin(function(){
                                               loginScreen.loginPantalla.find('.container2').scrollTo(this);
                                               });
    console.log('..loading login events');
    loginScreen.loginForm.parsley().on('form:success',function(){
                                       console.log('success form parsley');
                                       loginScreen.success = true;
                                       loginScreen.loginButton.append(app.loader);
                                       loginScreen.loginButton.prop('disabled',true);
                                       
                                       
                                       });
    console.log('...loading login submit event');
    loginScreen.loginForm.parsley().on('form:submit',function(){
                                       console.log('login submit');
                                       if(loginScreen.success){
                                       loginScreen.success = false;
                                       formData = loginScreen.loginForm.getFormData();
                                       formData.action = 'login';
                                       loginScreen.login(formData);
                                       }
                                       return false;
                                       });
},
    login : function(formData){
        console.log('login');
        formData.user_email += '@chapinometro.com';
        console.log(JSON.stringify(formData));
        
        $.ajax({
               url:app.url_ajax,
               dataType: 'json',
               data: formData,
               type: 'post',
               timeout: 15000,
               //crossDomain: true,
               //cache: false,
               //processData : false,
               //contentType: false,
               error: function(a,b,c){
               console.log('error '+JSON.stringify(a)+JSON.stringify(b));
               myModal.open('Error','Ha ocurrido un error, por favor intenta de nuevo');
               },
               success: function(a){
               console.log(a);
               
               if(a.msj_error === undefined){
               user.setProps(formData.user_email,formData.user_pass);
               user.vidas=parseInt(a.data.vidas);
               if(isNaN(user.vidas)){user.vidas=5;}
               niveles.vidas.html(user.vidas);
               niveles.getNiveles();
               loginScreen.loginPantalla.hide('slide',{direction:'left'},'fast');
               if(ifmovil){
               clevertap.profile.push({
                                      "Site": {
                                      "Email": ""+formData.user_email, // User's name
                                      "mail": ""+formData.user_email,
                                      "Identity":a.ID,
                                      "platform": ""+device.platform,
                                      "model": ""+device.model
                                      }
                                      });
               }
               
               clevertap.event.push("Login");
               //user.setPushes();
               
               }else{
               myModal.open('Error',a.msj_error);
               }
               },
               complete: function(){
               loginScreen.loginButton.html('ENTRAR');
               loginScreen.loginButton.prop('disabled',false);
               
               }
               
               });
    },
    skipLogin : function(){
        if(user.correo !=='' && user.password !==''){
            loginScreen.loginPantalla.hide();
            
        }
    }
    
};

var menuScreen = {
menu: $('#menu_principal'),
};

var cortina = {
cortina: $('#cortina'),
container: $('#cortina_container'),
show: function(){
    cortina.container.html(app.loader);
    cortina.cortina.show();
},
hide: function(){
    cortina.container.html('');
    cortina.cortina.hide();
}
};
var juego = {
nombreNivel: $('#nombreNivel'),
screen: $("#juego"),
wrapper: $("#juegoWrapper"),
timer: null,
contador: $("#segundos"),
tiempo_restante: 120,
preguntas: null,
respuestasBuenas:0,
respuestasContestadas:0,
respuestasSaltadas:0,
index: 0,
nivelJugando: null,
numeroNivel: null,
vidas: $('#texto_vidas_niveles2'),
imageCount: 0,
imagesLoaded: 0,
images: [],
sonidoInicio: null,
sonidoTiempo: null,
sonidoGanar: null,
sonidoPerder: null,
    
reset: function(){
    juego.respuestasBuenas = 0;
    juego.respuestasContestadas = 0;
    juego.respuestasSaltadas = 0;
    juego.preguntas = null;
    juego.timer = null;
    juego.tiempo_restante = 120;
    juego.wrapper.html('');
    juego.vidas.html(user.vidas);
    juego.index = 0;
    juego.imageCount = 0;
    juego.imagesLoaded = 0;
    juego.images = [];
    //juego.nivelJugando = null;
},
send_resultado: function(respuestas_buenas,preguntas_jugadas){
    console.log('nivel '+juego.nivelJugando);
    clevertap.event.push("Jugo nivel", {
                         "Respuestas buenas" :respuestas_buenas,
                         "Nivel"			 :juego.nombreNivel.html(),
                         "Preguntas jugadas" :preguntas_jugadas,
                         "Preguntas saltadas":juego.respuestasSaltadas
                         });
    $.ajax({
           url:app.url_ajax,
           dataType: 'html',
           data: {
           id_nivel: juego.nivelJugando,
           user_email: user.correo,
           user_pass: user.password,
           action: 'send_resultado',
           respuestas: respuestas_buenas
           },
           type: 'post',
           timeout: 15000,
           // processData : false,
           // contentType: false,
           error: function(a,b,c){
           console.log('error '+JSON.stringify(a)+JSON.stringify(b));
           },
           beforeSend: function(){
           console.log('mandando resultados '+respuestas_buenas);
           },
           success: function(a){
           console.log(a);
           },
           complete: function(){
           niveles.getNiveles();
           }
           });
    
},
send_vidas:function(vidas){
    $.ajax({
           url:app.url_ajax,
           dataType: 'html',
           data: {
           user_email: user.correo,
           user_pass: user.password,
           action: 'send_vidas',
           vidas: vidas
           },
           type: 'post',
           timeout: 15000,
           // processData : false,
           // contentType: false,
           error: function(a,b,c){
           console.log('error '+JSON.stringify(a)+JSON.stringify(b));
           },
           beforeSend: function(){
           console.log('mandando vidas '+vidas);
           },
           success: function(a){
           console.log(a);
           },
           complete: function(){
           
           }
           });
},
get_preguntas: function(id_nivel){
    var castigo = parseInt(window.localStorage.getItem('castigo'));
    console.log('castigo '+castigo);
    console.log(' '+!isNaN(castigo));
    if(!isNaN(castigo) && Date.now()<castigo){
        console.log('entro castigo');
        myModal.open('Qué neeecio','Tenés que esperar 9 minutos para volver a jugar!');
        return true;
    }else if(!isNaN(castigo) && Date.now()>castigo){
        console.log('quitar castigo');
        window.localStorage.setItem('castigo','');
        user.getVidas('reset');
        //user.vidas = 5;
        //juego.vidas.html(user.vidas);
    }
    juego.nivelJugando = id_nivel;
    if(ifmovil){
        //return Math.floor(Math.random() * (max - min + 1)) + min;
        var sonido_random_id = Math.floor((Math.random() * 11) );
        var mp3URL = getMediaURL(app.media[sonido_random_id]);
        juego.sonido = new Media(mp3URL,null,function(){
                                 console.log('error media');
                                 });
    }
    
    
    console.log('sonido random '+sonido_random_id);
    $.ajax({
           url:app.url_ajax,
           dataType: 'html',
           data: {
           id_nivel: id_nivel,
           user_email: user.correo,
           user_pass: user.password,
           action: 'get_preguntas'
           },
           type: 'post',
           timeout: 15000,
           // processData : false,
           // contentType: false,
           error: function(a,b,c){
           console.log('error '+JSON.stringify(a)+JSON.stringify(b));
           cortina.hide();
           myModal.open('Oops','Parece que ha ocurrido un error al cargar las preguntas. Por favor intenta de nuevo');
           },
           beforeSend: function(){
           juego.reset();
           cortina.show();
           },
           success: function(a){
           
           juego.wrapper.html(a);
           juego.preguntas = $('.pregunta',juego.wrapper);
           console.log(juego.preguntas);
           $(juego.preguntas[0]).show();
           //juego.comenzarJuego(sonido);
           
           
           },
           complete: function(a){
           
           
           }
           
           });
},
comenzarJuego: function(sonido){
    
    cortina.hide();
    juego.screen.show();
    if(ifmovil && user.sonidos){
        try{
            juego.sonido.play();
        }catch(e){
            console.log('error media play');
        }
    }
    
    $('.respuestaTexto').click(function(){
                               var dis = $(this);
                               juego.respuestasContestadas = juego.respuestasContestadas +1;
                               var esta = $(this).data('opcion');
                               var correcta = $(this).data('correcta');
                               if(esta==correcta){
                               juego.respuestasBuenas = juego.respuestasBuenas +1;
                               dis.addClass("breath");
                               dis.addClass("correcto");
                               }else{
                               dis.addClass("shake");
                               dis.addClass("incorrecto");
                               navigator.vibrate(400);
                               
                               user.vidas = user.vidas - 1;
                               if(user.vidas<=0){
                               //Sin vidas, terminar nivel
                               user.vidas = 0;
                               var minutos = Date.now() + app.espera;
                               window.localStorage.setItem('castigo',minutos);
                               var noti = Date.now() + app.espera;
                               if(ifmovil){
                               cordova.plugins.notification.local.schedule({
                                                                           id: 1,
                                                                           title: "¡Ya pasó el susto, muchá!",
                                                                           message: "Relax y seguí jugando con El Chapi pues",
                                                                           firstAt: noti,
                                                                           icon: "../img/iconos/logo-letra-azul.png",
                                                                           });
                               }
                               niveles.checkTimer();
                               console.log(minutos);
                               juego.limpiarTerminar(sonido);
                               return false;
                               }
                               juego.vidas.html(user.vidas);
                               }
                               
                               setTimeout(function(){
                                          console.log('index ocultando '+juego.index);
                                          $(juego.preguntas[juego.index]).hide();
                                          juego.index = juego.index + 1;
                                          //if(juego.index>9){
                                          if(juego.index> (juego.preguntas.length - 1)){
                                          juego.limpiarTerminar(sonido);
                                          }else{
                                          console.log('index mostrando '+juego.index);
                                          $(juego.preguntas[juego.index]).show();
                                          }
                                          },1000);
                               
                               
                               });
    juego.contador.html(juego.tiempo_restante);
    juego.timer = setInterval(function(){
                              
                              juego.tiempo_restante--;
                              juego.contador.html(juego.tiempo_restante);
                              juego.contador.addClass('breath_1');
                              setTimeout(function(){
                                         juego.contador.removeClass('breath_1');
                                         },300);
                              if(juego.tiempo_restante==20){
                              if(ifmovil && user.sonidos){
                              try{
                              juego.sonidoTiempo.play();
                              }catch(e){
                              console.log('error media play');
                              }
                              }
                              }
                              if(juego.tiempo_restante==0){
                              navigator.vibrate(1000);
                              juego.limpiarTerminar(sonido);
                              }
                              },1000);
},
limpiarTerminar: function(sonido){
    try{
        sonido.release();
    }catch(e){
        
    }
    
    clearInterval(juego.timer);
    juego.timer = null;
    juego.send_resultado(juego.respuestasBuenas, juego.respuestasContestadas);
    juego.send_vidas(user.vidas);
    niveles.vidas.html(user.vidas);
    if(juego.respuestasBuenas>=7){
        $('#pasasteNivel').show();
        if(ifmovil && user.sonidos){
            try{
                juego.sonidoGanar.play();
            }catch(e){
                console.log('error media play');
            }
        }
        
    }else{
        $('#noPasasteNivel').show();
        if(ifmovil && user.sonidos){
            try{
                juego.sonidoPerder.play();
            }catch(e){
                console.log('error media play');
            }
        }
    }
    
    juego.screen.hide();
},
saltarPregunta: function(){
    juego.respuestasContestadas = juego.respuestasContestadas +1;
    juego.respuestasSaltadas = juego.respuestasSaltadas + 1;
    $(juego.preguntas[juego.index]).hide();
    juego.index = juego.index + 1;
    //if(juego.index>9){
    if(juego.index > juego.preguntas.length || juego.respuestasSaltadas ==3){
        juego.limpiarTerminar();
    }else{
        $(juego.preguntas[juego.index]).show();
    }
},
salirJuego: function(){
    popup.salirNivel.screen.hide();
    juego.limpiarTerminar();
}
};
var niveles={
screen: $('#niveles'),
wrapper: $('#nivelesWrapper'),
vidas: $('#texto_vidas_niveles'),
checkTimer: function(){
    var tiempo = parseInt(window.localStorage.getItem('castigo'));
    console.log('tiempo '+tiempo);
    if(!isNaN(tiempo) && tiempo>Date.now()){
        $('#container-timer').show();
        $('#tiempo_restante').countdown(tiempo, function(event) {
                                        $(this).html(event.strftime('%M minutos : %S segundos'));
                                        }).on('finish.countdown',function(){
                                              console.log('finish timer');
                                              //checkTimer();
                                              user.getVidas('reset');
                                              });
    }else{
        /*
         if(!isNaN(tiempo) && Date.now()>tiempo){
         console.log('quitar castigo');
         window.localStorage.setItem('castigo','');
         console.log('reset vidas checktimer');
         user.getVidas('reset');
        	}else{
         console.log('get vidas checktimer');
         user.getVidas();
        	}*/
        $('#container-timer').hide();
    }
    
},
getNiveles: function(){
    niveles.checkTimer();
    $.ajax({
           url:app.url_ajax,
           dataType: 'html',
           data: {
           action: 'get_niveles',
           user_email: user.correo,
           user_pass: user.password,
           
           },
           type: 'post',
           timeout: 15000,
           error: function(a,b,c){
           console.log('error '+JSON.stringify(a)+JSON.stringify(b));
           niveles.wrapper.html('<div style="text-align:center;">Ocurrio un error. Por favor intenta de nuevo </div><button onclick="niveles.getNiveles();" class="btn btn-lg btn-primary btn-block bg-azul2">RECARGAR</button>');
           
           },
           beforeSend: function(){
           niveles.wrapper.html(app.loader_block);
           },
           success: function(a){
           niveles.wrapper.html(a);
           $('.nivelBtn').click(function(){
                                var bloqueado = $(this).hasClass('nivel_bloqueado');
                                if(bloqueado!=true){
                                var id_nivel = $(this).data('nivelid');
                                juego.get_preguntas(id_nivel);
                                }
                                });
           
           },
           complete: function(){
           }
           });
}
};


var fb = {
button: $('#fb_login_button'),
buttonHtml: 'Conectar con<div id="icono-facebook"></div>',
    fbLoginSuccess : function (userData) {
        console.log("UserInfo: " + JSON.stringify(userData));
    },
login: function(){
    fb.button.append(app.loader);
    fb.button.prop('disabled',true);
    facebookConnectPlugin.getLoginStatus(function(response) {
                                         if(debug){
                                            navigator.notification.alert("get login status "+JSON.stringify(response));
                                         }
                                         console.log(JSON.stringify(response));
                                         if (response.status === 'connected') {
                                         
                                         console.log('entro connected');
                                         var uid = response.authResponse.userID;
                                         var accessToken = response.authResponse.accessToken;
                                         fb.getInfo();
                                         }
                                         else {
                                         console.log('entro else fb');
                                         facebookConnectPlugin.login(["public_profile","email"],
                                                                     function(response2){
                                                                     //navigator.notification.alert("exito login "+JSON.stringify(response2));
                                                                     console.log("" + JSON.stringify(response2));
                                                                     var uid = response2.authResponse.userID;
                                                                     fb.getInfo();
                                                                     
                                                                     },
                                                                     function (error) {
                                                                     //navigator.notification.alert("error login "+JSON.stringify(error));
                                                                     fb.button.html(fb.buttonHtml);
                                                                     fb.button.prop('disabled',false);
                                                                     myModal.open('Error','Ha ocurrido un error al conectarse a Facebook. Por favor intenta de nuevo');
                                                                     
                                                                     console.log("" + JSON.stringify(error));
                                                                     }
                                                                     );
                                         }
                                         },function(error){
                                         
                                         fb.button.html(fb.buttonHtml);
                                         fb.button.prop('disabled',false);
                                         myModal.open('Error','Ha ocurrido un error al conectarse a Facebook. Por favor intenta de nuevo');
                                         console.log(""+JSON.stringify(error))
                                         if(debug){
                                         navigator.notification.alert("error login status "+JSON.stringify(response));
                                         }
                                         
                                         });
},
getInfo: function(){
    console.log('entro get info');
    facebookConnectPlugin.api("/me/?fields=id,name,email",["public_profile","email"],
                              function(response){
                              if(debug){
                                navigator.notification.alert("get info "+JSON.stringify(response));
                              }
                              console.log("user info "+JSON.stringify(response));
                              
                              if(typeof response.name != 'undefined' && response.name != null){
                              var user_name = response.name;
                              }else{
                              var user_name = 'Chapi Perez';
                              }
                              
                              if(typeof response.email != 'undefined' && response.email != null){
                              var user_email = response.email;
                              }else{
                              var user_email = response.id+"@"+response.id+'.com';
                              }
                              fb.wp_login(response.id,user_name, user_email);
                              
                              },
                              function (error) {
                              fb.button.html(fb.buttonHtml);
                              fb.button.prop('disabled',false);
                              myModal.open('Error','Ha ocurrido un error al conectarse a Facebook. Por favor intenta de nuevo');
                              
                              console.log("error friends" + JSON.stringify(error));
                              }
                              );
},
getFriends: function(){
    console.log('get friends');
    facebookConnectPlugin.getLoginStatus(function(status){
                                         console.log('Login Status: '+JSON.stringify(status));
                                         facebookConnectPlugin.api("/me/friends?fields=uid",["user_friends"],
                                                                   function(respone){
                                                                   console.log("friends "+JSON.stringify(respone));
                                                                   
                                                                   },
                                                                   function (error) { console.log("error friends" + JSON.stringify(error)); }
                                                                   );
                                         
                                         
                                         },function(error){
                                         
                                         });
    
},
wp_login: function(id,user_name,user_email){
    console.log(id);
    console.log(user_name);
    console.log(user_email);
    $.ajax({
           url:app.url_ajax,
           dataType: 'json',
           data: {
           action: 'fb_login',
           user_login: id,
           user_pass: id,
           user_email: user_email,
           user_name: user_name
           },
           type: 'post',
           timeout: 15000,
           error: function(a,b,c){
           console.log('error '+JSON.stringify(a)+JSON.stringify(b));
           myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
           },
           success: function(a){
           console.log(JSON.stringify(a));
           if(a.msj_error == undefined){
           user.setProps(id,id);
           user.vidas=parseInt(a.data.vidas);
           if(isNaN(user.vidas)){user.vidas=5;}
           niveles.vidas.html(user.vidas);
           niveles.getNiveles();
           loginScreen.loginPantalla.hide('slide',{direction:'left'},'fast');
           //user.setPushes();
           clevertap.profile.push({
                                  "Site": {
                                  "Email": ""+user_email, // User's name
                                  "mail": ""+user_email, // User's name,
                                  "Identity": a.ID,
                                  "platform": ""+device.platform,
                                  "model": ""+device.model
                                  }
                                  });
           }else{
           myModal.open('Error',a.msj_error);
           }
           
           },
           complete: function(){
           fb.button.html(fb.buttonHtml);
   		     	fb.button.prop('disabled',false);
           
           }
           
           });
}
};

var app = {
    // Application Constructor
sonidosBtn: $('#sonidos'),
espera: 1*60*1000,
pushID: '379510356782',
link: 'http://rumbafest.clx.mobi/descarga',
footer_select_html: '<div style="position:absolute;top:0;"><div class="circulo"><i style="color:white!important;font-size:10px;" class="fa fa-circle" aria-hidden="true"></i></div></div>',
media: ["sounds/papel-botella-ropa.m4a","sounds/pase-mi-reina.m4a",  "sounds/se-arregla-zapatos.m4a",
        "sounds/aceite-tiburon.m4a",    "sounds/arreglo-zapatos.m4a","sounds/botella-papel-ropa-2.m4a",
        "sounds/chuchito-tostada.m4a",  "sounds/explicacion.m4a",    "sounds/gomma-rollo.m4a",
        "sounds/guate.m4a",             "sounds/la-papa.m4a"
        ],
    footer : {
    perfil:  $('#footer-perfil'),
    cartelera: $('#footer-cartelera'),
    musica: $('#footer-musica'),
    promos: $('#footer-promos'),
    checkin: $('#footer-checkin')
    },
current_screen: '',
current_footer: null,//app.footer.cartelera,
    url : 'http://104.207.144.122/proyectos/chapinometro/',
    url_ajax : 'http://104.207.144.122/proyectos/chapinometro/wp-admin/admin-ajax.php',
loader_block: '<div style="display:block;margin:0 auto;width:40px;"><i class="fa fa-cog fa-spin" style="font-size:30px;font-color:black;"></i></div>',
    loader : '<div style="display:inline-block;margin:0 auto;width:40px;"><i class="fa fa-cog fa-spin" style="font-size:30px;font-color:black;"></i></div>',
    loader_mini : '<i class="fa fa-cog fa-spin" style="font-size:11px;font-color:black;"></i>',
socialSharing: function(){
    
    var link = $('#socialSharingBtn').data('link');
    var options = {
    files: [''+link],
    };
    
    window.plugins.socialsharing.shareWithOptions(options, function(){cortina.hide();}, function(){cortina.hide();});
},
toggleSound: function(){
    if(app.sonidosBtn.hasClass('sonido_on')){
        app.sonidosBtn.removeClass('sonido_on');
        app.sonidosBtn.addClass('sonido_off');
        window.localStorage.setItem('sonidos','false');
        user.sonidos = false;
    }else{
        app.sonidosBtn.removeClass('sonido_off');
        app.sonidosBtn.addClass('sonido_on');
        window.localStorage.setItem('sonidos','true');
        user.sonidos = true;
    }
},
initialize: function() {
    
    //ifmovil
    if(ifmovil){
        console.log('es movil');
        document.addEventListener("deviceready", this.onDeviceReady, false);
        document.addEventListener("resume", app.onResume, false);
    }else{
        console.log('no es movil');
        app.onDeviceReady();
    }
},
onResume: function(){
    var tiempo = parseInt(window.localStorage.getItem('castigo'));
    console.log('tiempo '+tiempo);
    if(!isNaN(tiempo) && Date.now()>tiempo){
        console.log('quitar castigo');
        window.localStorage.setItem('castigo','');
        console.log('reset vidas checktimer');
        user.getVidas('reset');
    }else{
        console.log('get vidas checktimer');
        user.getVidas();
    }
    niveles.checkTimer();
},
loadEvents: function(){
    
    if(ifmovil){
        
        var sonidoGanar = getMediaURL('sounds/marimba-win.wav');
        juego.sonidoGanar = new Media(sonidoGanar,function(){
                                      //navigator.notification.alert("Exito");
                                      },function(){
                                      //navigator.notification.alert("Error");
                                      console.log('error media');
                                      });
        
        var sonidoTiempo = getMediaURL('sounds/apurate-pue.m4a');
        juego.sonidoTiempo = new Media(sonidoTiempo,function(){
                                       //navigator.notification.alert('success sonido tiempo');
                                       },function(){
                                       console.log('error media');
                                       });
        var sonidoPerder = getMediaURL('sounds/marimba-loser.wav');
        juego.sonidoPerder = new Media(sonidoPerder,null,function(){
                                       console.log('error media');
                                       });
        
    }
    
    $.each(['show', 'hide'], function (i, ev) {
           var el = $.fn[ev];
           $.fn[ev] = function () {
    	      this.trigger(ev);
    	      return el.apply(this, arguments);
           };
           });
    $('.history_subscreen').on('show',function(e){
                               e.stopPropagation();
                               var close = $(e.target).data('cerrar');
                               if(close==undefined || app.history[app.history.length-1]==close){
                               return false;
                               }
                               app.history.push(close);
                               console.log('show. length '+app.history.length+' data '+close);
                               
                               });
    $('.history_subscreen').on('hide',function(e){
                               e.stopPropagation();
                               var id = $(e.target).attr('id');
                               if(app.history_allowed.indexOf(id)==-1){
                               return false;
                               }
                               app.history.pop();
                               console.log('history.pop');
                               });
    
    //$('.inputpz').on('focus',function(){
    $(document).on('focus','.inputpz',function(){
                   console.log('focus inputpz');
                   console.log($(this));
                   var parent = $(this).closest('.container');
                   console.log(parent);
                   parent.scrollTo(this);
                   });
    myModal.modal.on('show.bs.modal',function(){
                     app.history.push('myModal.modal');
                     });
    myModal.modal.on('hide.bs.modal',function(e){
                     app.history.pop();
                     });
    $('.menu').click(function(){menuScreen.menu.show('slide',{direction:'left'});});
    //$('#login_screen').hide();
},	
history: [],
history_allowed: [],
backButton: function(e){
    /*
     Pantalla Perfil 			- 1
     Pantalla Cartelera			- 2
     Pantalla Promos 			- 3
     Pantalla Checkin			- 4
     */
    console.log('entro backbutton');
    console.log('history length '+app.history.length);
    console.log(app.history[app.history.length-1]);
    if(app.history.length>0){
        if(isNaN(app.history[app.history.length-1])){
            switch(app.history[app.history.length-1]){
                    
                case 'myModal.modal':
                    myModal.modal.modal('hide');
                    break;
                default:
                    try{
                        eval(app.history.pop());
                    }catch(e){
                        console.log('error eval backbutton');
                    }
                    
                    break;
            }
        }
        if(ifmovil){
            e.preventDefault();
        }
        
        return false;
    }else{
        console.log('exit app');
        navigator.app.exitApp();
    }
    
},
onDeviceReady: function() {
    if(ifmovil){
        pushNotification = window.plugins.pushNotification;
    }
    
    
    console.log('device ready');
    document.addEventListener("backbutton", app.backButton, false);
    loginScreen.loadScreenEvents();
    registerScreen.loadScreenEvents();
    app.loadEvents();
    user.initialize();
    
    
},
showScreen: function(screenToShow,indexFooter,pop){
    
    if(app.current_screen!=screenToShow){
        app.current_screen.hide();
        app.current_footer.prev().remove();
        if(app.current_screen == perfilScreen.perfilPantalla && pop!='pop'){
            console.log('push 1');
            app.history.push(1);
        }else if(app.current_screen == carteleraScreen.carteleraPantalla && pop!='pop'){
            console.log('push 2');
            app.history.push(2);
        }else if(app.current_screen == promosScreen.promosPantalla && pop!='pop'){
            console.log('push 3');
            app.history.push(3);
        }else if(app.current_screen == checkinScreen.checkinPantalla && pop!='pop'){
            console.log('push 4');
            app.history.push(4);
        }
        
    }
    
    switch(indexFooter){
        case 0:
            if(app.current_screen!=screenToShow){
                app.current_screen = perfilScreen.perfilPantalla;
                app.current_screen.show();
                app.current_footer = app.footer.perfil;
                app.current_footer.parent().prepend(app.footer_select_html);
            }
            
            perfilScreen.get();
            break;
        case 1:
            if(app.current_screen==screenToShow){
                carteleraScreen.eventosSubscreen.get();
            }else{
                app.current_screen = carteleraScreen.carteleraPantalla;
                app.current_screen.show();
                
                app.current_footer = app.footer.cartelera;
                app.current_footer.parent().prepend(app.footer_select_html);
            }
            
            break;
        case 2:
            if(app.current_screen!=screenToShow){
                app.current_screen = promosScreen.promosPantalla;
                app.current_screen.show();
                app.current_footer = app.footer.promos;
                app.current_footer.parent().prepend(app.footer_select_html);
            }
            promosScreen.get();
            
            break
        case 3:
            if(app.current_screen!=screenToShow){
                app.current_screen = musicaScreen.musicaPantalla;
                app.current_screen.show();
                app.current_footer = app.footer.musica;
                app.current_footer.parent().prepend(app.footer_select_html);
            }
            
            break
        case 4:
            if(app.current_screen!=screenToShow){
                app.current_screen = checkinScreen.checkinPantalla;
                app.current_screen.show();
                app.current_footer = app.footer.checkin;
                app.current_footer.parent().prepend(app.footer_select_html);
                
            }
            checkinScreen.get();
            break;
    }
    app.current_screen = screenToShow;
},
};

$.fn.scrollTo = function( target, options, callback ){
    if(typeof options == 'function' && arguments.length == 2){ callback = options; options = target; }
    var settings = $.extend({
                            scrollTarget  : target,
                            offsetTop     : 50,
                            duration      : 500,
                            easing        : 'swing'
                            }, options);
    return this.each(function(){
                     var scrollPane = $(this);
                     var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
                     var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
                     scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
                                        if (typeof callback == 'function') { callback.call(this); }
                                        });
                     });
}
$.fn.cleanForm = function(){
    $(':input',this)
    .not(':button, :submit, :reset, :hidden')
    .val('')
    .removeAttr('checked')
    .removeAttr('selected');	
}
$.fn.getFormData = function(){
    var thisForm = this;
    var data = {};
    $(thisForm).find('.inputpz').each(function(){
                                      var name = $(this).attr('name');
                                      if($(this).is('select')){
                                      data[name] = $(this).val();
                                      }else if($(this).is('input')){
                                      var type = $(this).attr('type');
                                      switch (type){
                                      case 'hidden':
                                      data[name] = $(this).val();
                                      break;
                                      case 'text':
                                      data[name] = $(this).val();
                                      break;
                                      case 'radio':
                                      var valor = $('input[name='+name+']:checked', thisForm).val();
                                      data[name] = valor;
                                      break;
                                      case 'checkbox':
                                      var valor = $('input[name='+name+']:checked', thisForm).map(function(){
                                                                                                  return this.value;
                                                                                                  }).get();
                                      data[name] = valor;
                                      break;
                                      case 'date':
                                      data[name] = $(this).val();
                                      break;
                                      case 'email':
                                      data[name] = $(this).val();
                                      break;
                                      case 'number':
                                      data[name] = $(this).val();
                                      break;
                                      case 'password':
                                      data[name] = $(this).val();
                                      break;
                                      case 'time':
                                      data[name] = $(this).val();
                                      break;
                                      }
                                      }else if($(this).is('textarea')){
                                      
                                      data[name] = $(this).val();
                                      }
                                      
                                      
                                      });
    console.log(JSON.stringify(data));
    return data;
}
function getMediaURL(s) {
    if(device.platform.toLowerCase() === "android") return "/android_asset/www/" + s;
    return s;
}
app.initialize();

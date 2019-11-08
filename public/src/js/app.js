
var deferredPrompt;
var enableNotificationButton = document.querySelectorAll('.enable-notifications')


if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

// Displaying Notifications within Service Workers
function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    var options = {
      body: 'You successfully subcribed to our notification service!',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US', // BCP 47,
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: false,
      actions: [
        { 
          action: 'confirm', 
          title: 'Okay', 
          icon: '/src/images/icons/app-icon-96x96.png' 
        },
        { 
          action: 'cancel', 
          title: 'Cancel', 
          icon: '/src/images/icons/app-icon-96x96.png' 
        }
      ]
    }
    navigator.serviceWorker.ready
      .then(function (swreg) {
        swreg.showNotification('Succesfully Subscribed (From SW) !', options)
      })
  }
}

function configurePushSub () {
  if (!('serviceWorker' in navigator)){
    return
  }

  var reg;
  navigator.serviceWorker.ready
    .then(function (swreg) {
      reg = swreg
      return swreg.pushManager.getSubscription()
    })
    .then(function (sub) {
      if (sub === null){
        // Create a new Subscription
        reg.pushManager.subscribe({
          userVisibleOnly: true,
        })
      }else {
        // We have a subscription

      }
    })
}


function askForNotificationPermission () {
  Notification.requestPermission(function (result) {
    console.log('User Choice', result);
    if (result !== 'granted'){
      console.log('No Notification permission granted !')
    }else{
      configurePushSub()
      // displayConfirmNotification()
    }
  })
}



if ('Notification' in window && 'serviceWorker' in navigator) {
  for (var i = 0; i< enableNotificationButton.length; i++){
    console.log('enableNotificationButton[i].style.display : ', enableNotificationButton[i].style.display);
    enableNotificationButton[i].style.display = 'inline-block'
    enableNotificationButton[i].addEventListener('click',askForNotificationPermission)
  }
}
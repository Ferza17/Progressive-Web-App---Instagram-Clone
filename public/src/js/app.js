
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
        swreg.showNotification('Succesfully Subscribed !', options)
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
        var vapidPublicKey = 'BEaHg5f1a3u2VGz3O8-trdv9yQnuVDP4-Xlqmll0ZNg9XT6xHJ4ouYiMyme_8-UOwBJgrsVYOIrea7CVEyIAdPw'
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey)
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey
        })
        
      }else {
        // We have a subscription

      }
    })
    .then(function (newSub) {
      return fetch('https://pwagram-4a4fe.firebaseio.com/subscriptions.json',{
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(function (res) {
      if (res.ok){
        displayConfirmNotification()
      }
    })
    .catch(function (err) {
      console.log(err);
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
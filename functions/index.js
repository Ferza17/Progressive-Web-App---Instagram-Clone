const functions = require('firebase-functions')
const admin = require('firebase-admin')
const cors = require('cors')({origin: true})
const webpush = require('web-push')
const formidable = require('formidable')
const fs = require('fs')
const UUID = require('uuid-v4')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const serviceAccount = require("./pwaGram-db-key.json");

const gcconfig = {
    projectId: 'pwagram-4a4fe',
    keyFilename: 'pwaGram-db-key.json'
}

const gcs = require('@google-cloud/storage')(gcconfig)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pwagram-4a4fe.firebaseio.com/'
})

exports.storePostData = functions.https.onRequest((request, response) => {
 cors(request,response,() => {
     const uuid = UUID()
     const formData = new formidable.IncomingForm()
     formData.parse(request, (_err, fields, files) => {
         fs.rename(files.file.path, '/tmp/'+ files.file.name)
         const bucket = gcs.bucket('pwagram-4a4fe.appspot.com/')

        bucket.upload('/tmp/' + files.file.name, {
             upload: 'media',
             metadata: {
                 metadata: {
                     contentType: files.file.type,
                     firebaseStorageDownloadTokens: uuid
                 }
             }
         }), (_err, file) => {
             if(!_err){

                admin.database().ref('posts').push({
                    id : fields.id,
                    title: fields.title,
                    location: fields.location,
                    image: 'https://firebasestorage.googleapis.com/v0/b/' + bucket.name + '/0/' + encodeURIComponent(file.name) + '?alt=media&token=' + uuid
                })
                .then(()=>{
                   webpush.setVapidDetails('mailto: feryreza85@gmail.com','BEaHg5f1a3u2VGz3O8-trdv9yQnuVDP4-Xlqmll0ZNg9XT6xHJ4ouYiMyme_8-UOwBJgrsVYOIrea7CVEyIAdPw','emm92JeurPI7c1JLwhPBLz66Ee1lN5plAHpTDXbUGrA' )
                   return admin.database().ref('subscriptions').once('value') 
                })
                .then((subscription)=> {
                    subscription.forEach((sub)=> {
                        var pushConfig = {
                            endpoint: sub.val().endpoint,
                            keys: {
                                auth: sub.val().keys.auth,
                                p256dh: sub.val().keys.p256dh
                            }
                        }
                        
                        try {
                           webpush.sendNotification(pushConfig, JSON.stringify({
                               title: 'New Post',
                               content: 'New Post added!',
                               openUrl: '/help'
                           }))
                        } catch (error) {
                            console.log(error)
                        }
                    })
                    return response.status(201).json({
                       messege: 'Data stored',
                       id: fields.id
                      })
           
                })
                .catch((err)=>{
                    return response.status(500).json({error: err})
                })

             }else{
                 console.log(err);
             }
         }
     })
 })
});

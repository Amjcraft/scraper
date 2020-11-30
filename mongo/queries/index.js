const mongoDB = require('./../client.js')();

const PARK_DETAILS = 'park_details';
const PARK_RESERVATIONS = 'park_reservations';


exports.insertParks = (documents) => {
    return mongoDB.then( (db) => {
      db.collection(PARK_DETAILS).insertMany(documents)
      .then(function(result) {
        console.log('Park Details Save Success');
      })
    })
}

exports.updatePark = (document) => {
    return mongoDB.then( (db) => {
      db.collection(PARK_DETAILS).updateOne(
        { _id: document.id },
        { $set: document,
          $currentDate: { lastModified: true } })
      .then(function(result) {
        console.log(result);
      }) 
    })    
}

exports.getParks = () => {
  return mongoDB.then( (db) => {
    db.collection(PARK_DETAILS).find()
    .then(function(result) {
      console.log('All Parks Success');
      console.log(result);
    });
  });  
}

exports.findPark = (query) => {
    return mongoDB.then( (db) => {
      db.collection(PARK_DETAILS).findOne(query)
      .then(function(result) {
        console.log(result);
      });
    });  
}

exports.insertReservation = (document) => {
  return mongoDB.then( (db) => {
    db.collection(PARK_RESERVATIONS).insertOne(document)
    .then(function(result) {
      console.log(result);
    })
  })
}


exports.updateReservation = (document) => {
  return mongoDB.then( (db) => {
    db.collection(PARK_RESERVATIONS).updateOne(
      { _id: document.id },
      { $set: document,
        $currentDate: { lastModified: true } })
    .then(function(result) {
      console.log(result);
    })
  });    
}

exports.findReservation = (query) => {
  return mongoDB.then( (db) => {
    db.collection(PARK_RESERVATIONS).findOne(query)
    .then(function(result) {
      console.log(result);
    });
  }); 
}
/*google.maps.event.addDomListener(window, 'load', function () {
    let mapOtions = {
        center: new google.maps.LatLng(32.085300, 34.781768),
        //center: new google.maps.LatLng(32.1250386, 34.7984045),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    let map = new google.maps.Map(document.getElementById("mymap"), mapOtions);

    let humusplaces = [
        ["רוני פול", "אילת 22", "תל אביב", 32.057890, 34.763971],
        ["המטבח של רמה", "נטף 18", "נטף", 31.830146, 35.072147],
        ["מפגש אושר", "המלך ג'ורג' 105", "תל אביב", 32.077797, 34.778067],
        ["חומוס בראשית", "שדרות לכיש 33", "קרית גת", 31.610734, 34.772023]
    ];

    let image = {
        url: 'img/restaurant.png',
        /!*size: new google.maps.Size(20, 32),
         origin: new google.maps.Point(0, 0),
         anchor: new google.maps.Point(0, 32)*!/
    };

    /!*let shape = {
     coords: [1, 1, 1, 20, 18, 20, 18, 1],
     type: 'poly'
     };*!/

    for (let i = 0; i < humusplaces.length; i++) {
        let humus = humusplaces[i];
        let marker = new google.maps.Marker({
            title: humus[0],
            position: {lat: humus[3], lng: humus[4]},
            //icon: image,
            //shape: shape,
            map: map
        });

        let infoWindow = new google.maps.InfoWindow({
            content: `<div class=info-window>`
            + `<h2>${humus[0]}</h2>`
            + `<p>${humus[1]}</p>`
            + `${humus[2]}`
        });

        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open(map, marker);
            //map.setZoom(15);
        });

        google.maps.event.addListener(infoWindow, 'closeclick', function () {
            //map.setZoom(mapOtions.zoom);
        });
    }

    /!* //creating a simple overlay marker
     let coordinates = new google.maps.LatLng(32.057890, 34.763971);
     let marker = new google.maps.Marker({position:coordinates,title:"rony phul"});
     marker.setMap(map);*!/
});*/

/*--------------------------- Indexed DB ---------------------------*/

window.indexedDB = window.indexedDB ||
    //window.mozIndexedDB ||
    //window.webkitIndexedDB ||
    window.msIndexedDB;

if (!window.indexedDB) {
    console.log("The browser doesn't support IndexedDB");
}

var indxDB = {};

indxDB.openDB = function () {
    indxDB.dbOpenDBRequest = window.indexedDB.open('humusDB', 1);

    indxDB.dbOpenDBRequest.onerror = function (event) {
        console.log('error: ' + event.target.errorCode);
        humusUtils.showMessage('Error', event.target.errorCode);
    };
    indxDB.dbOpenDBRequest.onsuccess = function (event) {
        console.log(event.target.result.objectStoreNames);

        //indxDB.dbDatabase = indxDB.dbOpenDBRequest.result;
        indxDB.dbDatabase = event.target.result;
        console.log("success: " + indxDB.dbDatabase);

        indxDB.dbDatabase.onerror = function (errorEvent) {
            // Generic error handler for all errors targeted at this database's requests!
            humusUtils.showMessage('Error', 'Database error: ' + errorEvent.target.errorCode);
        };
        indxDB.readAllItems();
    };
    indxDB.dbOpenDBRequest.onupgradeneeded = function (event) {
        indxDB.dbDatabase = event.target.result;

        //db.dbDatabase.deleteObjectStore('humus');

        let objectStore = indxDB.dbDatabase.createObjectStore('humus', {keyPath: 'id', autoIncrement: false});
        //objectStore.createIndex('id', 'id', {unique: true});
        console.log("creating db: " + indxDB.dbDatabase);

        let transaction = event.target.transaction;
        transaction.oncomplete = function (event) {
            // Now store is available to be populated
            $.ajax({
                url: 'humusplaces.json',
                dataType: 'json',
                success: function (data, status) {
                    $.each(data, function (key, val) {
                        let place = new HumusPlace(key,
                            val.name,
                            val.city,
                            val.address,
                            val.lat,
                            val.lng)
                        indxDB.addItem(place);
                    });
                    indxDB.readAllItems();
                },
                error: function (xhr, status, error) {
                    humusUtils.communicationError(status + " " + error);
                }
            });
        };
    };
}

indxDB.closeDB = function () {
    indxDB.dbDatabase.close();
};

indxDB.addItems = function (items) {
    // open a read/write db transaction, ready for adding the data
    var transaction = indxDB.dbDatabase.transaction(['humus'], 'readwrite')

    // report on the success of opening the transaction
    transaction.oncomplete = function(event) {
        console.log('Transaction completed: database modification finished');
    };

    transaction.onerror = function(event) {
        console.log('Transaction not opened due to error. Duplicate items not allowed');
        humusUtils.showMessage('Error', 'Transaction not opened due to error. Duplicate items not allowed');
    };

    // create an object store on the transaction
    var objectStore = transaction.objectStore('humus');
    console.log(objectStore.keyPath);

    // add our newItem object to the object store
    var objectStoreRequest = objectStore.add(items);

    objectStoreRequest.onsuccess = function(event) {
        // report the success of our new item going into the database
        console.log('New item added to database');
    };
}

indxDB.addItem = function (obj = {id: id, name: name, city: city, address: address, lat: lat, lng: lng}) {
    // Create a new object ready to insert into the IDB
    var newItem = [ {id: obj.id, name: obj.name, city: obj.city, address: obj.address, lat: obj.lat, lng: obj.lng} ];

    // open a read/write db transaction, ready for adding the data
    var transaction = indxDB.dbDatabase.transaction('humus', 'readwrite')

    // report on the success of opening the transaction
    transaction.oncomplete = function(event) {
        console.log('Transaction completed: database modification finished');
    };

    transaction.onerror = function(event) {
        console.log('Transaction not opened due to error. Duplicate items not allowed');
        humusUtils.showMessage('Error', 'Transaction not opened due to error. Duplicate items not allowed');
    };

    // create an object store on the transaction
    var objectStore = transaction.objectStore('humus');
    console.log(objectStore.keyPath);

    // add our newItem object to the object store
    var objectStoreRequest = objectStore.add(newItem[0]);

    objectStoreRequest.onsuccess = function(event) {
        // report the success of our new item going into the database
        console.log('New item added to database');
    };
}

indxDB.readItem = function(id) {
    let transaction = indxDB.dbDatabase.transaction(['humus']);
    let objectStore = transaction.objectStore('humus');
    let request = objectStore.get(id);

    request.onerror = function (event) {
        console.log('readItem(): cannot find the data item');
        humusUtils.showMessage('Error', 'cannot find the data item');
    };
    request.onsuccess = function (event) {
        if (request.result) {
            console.log('readItem(): ' + request.result.id + ', '
                + request.result.name + ', ' + request.result.city
                + request.result.address + ', ' + request.result.lat + ', ' + request.result.lng
            );
        }
        else {
            console.log('readItem(): cannot find the item');
        }
    };
}

indxDB.readAllItems = function() {
    //indxDB.removeAllItems();

    let objectStore = indxDB.dbDatabase.transaction('humus').objectStore('humus');

    objectStore.openCursor().onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            /*$.each(cursor.value, function (key, val) {
             console.log('readAllItems(): id = ' + val.id + ' name = '
             + val.name + ' city = ' + val.city
             + ' address = ' + val.address + ' lat = ' + val.lat
             + ' lng = ' + val.lng);

             humusPlacesList.add(new HumusPlace(val.id,
             val.name,
             val.city,
             val.address,
             val.lat,
             val.lng));
             });*/

            console.log('readAllItems(): id = ' + cursor.value.id + ' name = '
                + cursor.value.name + ' city = ' + cursor.value.city
                + ' address = ' + cursor.value.address + ' lat = ' + cursor.value.lat
                + ' lng = ' + cursor.value.lng);

            humusPlacesList.add(new HumusPlace(cursor.value.id,
                                               cursor.value.name,
                                               cursor.value.city,
                                               cursor.value.address,
                                               cursor.value.lat,
                                               cursor.value.lng));
            cursor.continue();
        }
        else {
            console.log('readAllItems(): no more entries!');
        }
        $('#imgSpinner').hide();
    };
}

indxDB.removeItem = function(id) {
    let request = indxDB.dbDatabase.transaction('humus', 'readwrite')
        .objectStore('humus')
        .delete(+id);

    request.onsuccess = function (event) {
        console.log("removeItem(): the data item was removed from the database");
    };

    request.onerror = function (event) {
        console.log("removeItem(): problem with removing a data item from the database");
    }
}

indxDB.removeAllItems = function() {
    let transaction = indxDB.dbDatabase.transaction('humus', 'readwrite');
    let objectStore = transaction.objectStore('humus');

    // clear all the data out of the object store
    var objectStoreRequest = objectStore.clear();

    objectStoreRequest.onsuccess = function (event) {
        // report the success of our clear operation
        console.log('Data cleared');
    };
}

/*--------------------------- Indexed DB ---------------------------*/

class HumusPlace {
    constructor(id, name, city, address, lat, lng) {
        this.id = id,
        this.name = name;
        this.city = city;
        this.address = address;
        this.lat = lat;
        this.lng = lng;
    }
}

class HumusPlacesList {
    constructor() {
        this.places = [];
    }

    add(obj = {id: id, name: name, city: city, address: address, lat: lat, lng: lng}) {
        // add to array
        this.places.push(obj);

        // add to listview
        let title = "<span style=font-size: 0.9; font-weight: 600>" + obj.name + ", " +  obj.address + " " + obj.city + "</span>";

        let li = document.createElement('li');
        $(li).addClass('ui-li-has-alt'); // ui-screen-hidden

        let button = document.createElement('a');
        $(button).click(function () {
            humusPlacesList.goToMarker(obj.id);
            $("#tabs").tabs('option', 'active', 0);
            $("#nbSearch").removeClass("ui-btn-active"); // display not active to serach tab
            $("#nbMap").addClass("ui-btn-active"); // display active to map tab
        }).html(title).addClass('ui-btn ui-btn-inline'); // ui-btn-icon-left ui-icon-carat-l

        let divider = document.createElement('a');
        $(divider).click(function () {
            $('#dialogTitle').html(obj.name);
            $('#dialogHeader').html('בטוח שברצונך למחוק?');
            $('#btnDialogCancel').show();
            $('#btnDialogDelete').show();
            $('#popupDialog').popup('open', {transition: 'fade'});

            $("#popupDialog #btnDialogDelete").one("click.popupDialog", function () {
                $(li).remove()
                $('#list').listview('refresh');
                humusPlacesList.remove(obj.id);
            });

        }).html('delete').addClass('ui-btn ui-btn-icon-notext ui-btn-icon-left ui-icon-delete');

        $(li).html(button).append(divider);
        $('#list').append(li);
        $('#list').listview('refresh');

        // add to map
        this.addMarker(obj);
    }

    remove(id) {
        let place = this.places.find(p => p.id == id);
        let index = this.places.indexOf(place);
        if (index > -1) {
            this.places.splice(index, 1);
        }
        this.removeMarker(id);
        indxDB.removeItem(id);
    }

    /*get(id) {
        return this.places.find(p => p.id == id);
    }*/

    createNewPlace() {
        let newPlaceName = $('#newPlaceName').val();
        if(newPlaceName == '') {
            humusUtils.showMessage('חומוס', 'הכנס שם מסעדה בבקשה');
            return;
        }

        let address = $('#address').val();
        if(address == '') {
            humusUtils.showMessage('חומוס', 'הכנס כתובת בבקשה');
            return;
        }

        let places = this.places;
        let geocoder = new google.maps.Geocoder();

        geocoder.geocode({'address': address, componentRestrictions: {country: 'IL'}}, function(results, status) {
            if (status === 'OK') {
                let city = '';
                let number = 0;
                let add = '';

                $.each(results[0].address_components, function (i, address_component) {
                    if (address_component.types[0] == "locality")
                        city = address_component.long_name;
                    if (address_component.types[0] == "street_number")
                        number = address_component.long_name;
                    if (address_component.types[0] == "route")
                        add = address_component.long_name;
                });

                let place = places.find(p => p.lat == results[0].geometry.location.lat()
                                            && p.lng == results[0].geometry.location.lng());
                if(place != undefined) {
                    humusUtils.showMessage('חומוס', 'כתובת קיימת במפה');
                    return;
                }

                $("#humusAddedDialog a").off('click');

                // add?
                $('#addedPlaceName').html(newPlaceName);
                $('#addedTitle').html('להוסיף?');
                $('#addedPlaceCity').html(city);
                $('#addedPlaceStreet').html(add + ' ' + number);
                $('#btnAddedYes').show();
                $('#btnAddedNo').show();
                $('#btnAddedMap').hide();
                $('#humusAddedDialog').popup('open', {transition: 'fade'});

                // yes
                $('#btnAddedYes').one('click', function () {
                    let id = places.length;
                    let p = new HumusPlace(id,
                        newPlaceName,
                        city,
                        add + ' ' + number,
                        results[0].geometry.location.lat(),
                        results[0].geometry.location.lng());
                    humusPlacesList.add(p);
                    indxDB.addItem(p);

                    // added
                    $('#addedPlaceName').html(newPlaceName);
                    $('#addedTitle').html('הוסף בהצלחה');
                    $('#addedPlaceCity').html(city);
                    $('#addedPlaceStreet').html(add + ' ' + number);
                    $('#btnAddedYes').hide();
                    $('#btnAddedNo').hide();
                    $('#btnAddedMap').show();

                    // go to map
                    $('#btnAddedMap').one('click', function () {
                        $("#tabs").tabs('option', 'active', 0);
                        $("#nbAdd").removeClass("ui-btn-active");
                        $("#nbMap").addClass("ui-btn-active");
                        humusPlacesList.goToMarker(id);
                    });

                    $('#newPlaceName').val(' ');
                    $('#address').val(' ');
                });
            }
            else {
                humusUtils.showMessage('חומוס', 'Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    addMarker (obj = {id: id, name: name, city: city, address: address, lat: lat, lng: lng}) {
        let id = obj.id;
        let name = obj.name;
        let lat = obj.lat;
        let lng = obj.lng;
        let address = obj.address;
        let city = obj.city;

        $('#mymap').gmap('addMarker',
            {
                'id': id,
                'title': name,
                'position': new google.maps.LatLng(lat, lng),
                'icon': 'img/humus.gif',
                /*'icon': {
                 path: MAP_PIN,
                 fillColor: '#1998F7',
                 fillOpacity: 1,
                 strokeColor: '',
                 strokeWeight: 0
                 },
                 'map_icon_label': '<span class="map-icon map-icon-restaurant"></span>',*/
                'bounds': false
            }).click(function () {
            $('#mymap').gmap('openInfoWindow', {
                'content': '<div id="iw-container">'
                + '<div class="iw-title">' + name + '</div>'
                + '<p>' + address + '</p>'
                + city + '</div>'
                + '<a href=waze://?ll=' + lat + ',' + lng + '&navigate=yes ' +
                'class="ui-btn ui-btn-inline ui-icon-navigation ui-btn-icon-left ui-btn-corner-all ui-shadow ui-alt-icon">Waze</a>'
            }, this);
        });
    }

    goToMarker(id) {
        $('#mymap').gmap('find', 'markers', { } , function(marker) {
            if(marker.id == id) {
                $('#mymap').gmap('get','map').setOptions({'center': marker.position});
                google.maps.event.trigger(marker, 'click');
            }
        });
    }

    removeMarker(id) {
        $('#mymap').gmap('get', 'markers')[id].setMap(null);
    }
}

var humusPlacesList = new HumusPlacesList();

var humusUtils = {};

humusUtils.showMessage = function (title, text) {
    $('#messageTitle').html(title);
    $('#messageText').html(text);
    $('#message').popup('open', {transition: 'fade'});
};

humusUtils.communicationError = function (error) {
    console.log("error: " + error);
    $("#tabs").tabs("disable", 1);
    $("#pMap").html("<br><br><br>Can't get Data.<br>Check your internet connection and try again");
    $("#imgSpinner").hide();
};

/**
 * Check if a database exists
 * @param {string} name Database name
 * @param {function} callback Function to return the response
 * @returns {bool} True if the database exists
 */
humusUtils.databaseExists = function (name, callback) {
    var dbExists = true;
    var request = window.indexedDB.open(name);

    request.onupgradeneeded = function (e) {
        if (request.result.version === 1) {
            dbExists = false;
            window.indexedDB.deleteDatabase(name);
            if (callback)
                callback(dbExists);
        }

    };
    request.onsuccess = function (e) {
        if (dbExists) {
            if (callback)
                callback(dbExists);
        }
    };
};

$(document).on('pageshow' ,function () {
    $('#imgSpinner').show();

    $('#mymap').gmap({'center': '32.077797, 34.778067', 'zoom': 15, 'mapTypeId': google.maps.MapTypeId.ROADMAP});

    let map = $('#mymap').gmap('get', 'map');
    $(map).click(function () {
        $('#mymap').gmap('closeInfoWindow');
    });

    indxDB.openDB();
    //window.indexedDB.deleteDatabase('humusDB');

    /*humusUtils.databaseExists('humusDB', function(exists) {
        if (exists) {
            console.debug("database " + name + " exists");
        }
        else {
            console.debug("database " + name + " does not exists");
        }
    });*/

    $('#tabs').on('tabsactivate', function (event, ui) {
       switch (ui.newTab.index()) {
           case 0: // map
                $('#mymap').gmap('refresh');
               break;
           case 1: // add
               break;
           case 2: // search
               break;
       }
    });
});


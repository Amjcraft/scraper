module.exports = (marker) => {
    const photoURIDeconstruct = (URL) => {
        const lastHashIdx = URL.lastIndexOf('/')
        return URL.substr(0, lastHashIdx - 1);
    }

    return {
        lat: marker.lat,
        lng: marker.lng,
        id: marker.parkid,
        _id: marker.parkid,
        parkName: marker.parkname,
        photoURI: photoURIDeconstruct(marker.photoPath)
    }
}
const express = require('express');

let formatTime = {};

formatTime.getTime = function () {
    let date = new Date();

    let month = String(date.getMonth() + 1).padStart(2, '0');
    let d = String(date.getDate()).padStart(2, '0');
    let h = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month}.${d}. ${h}:${minutes}`;
}

module.exports = formatTime;
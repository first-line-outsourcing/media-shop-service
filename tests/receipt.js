const print = require('../api/print').receipt;

print({
    body: {
      "id": "qwe1-12dqsd-123cdfb-345243",
      "number": 20,
      "date": "05.07.2017",
      "address": {
        "streetAddress": "825 Dawson drive",
        "addressLine2": "Qwintry Suite 12-139801",
        "city": "Newark",
        "state": "Delaware",
        "zip": "19712",
        "country": "Saint Pierre and Miquelon"
      },
      "currency": "$",
      "payment": "Bitcoin",
      "products": [
        {
          "title": "Defiant (#Wattys2017)",
          "desc": "Leora has only ever been two things: an orphan, and a thief. The castle dungeons have become a second home to her. A far better ",
          "price": 9,
          "count": 1,
          "total": 9
        }, {
          "title": "Crossbones  (COMPLETED) #Wattys2017",
          "desc": "The only thing more dangerous than a pirate is loving a pirate.          Lorelei Storm has always known you can never trust p",
          "price": 3,
          "count": 1,
          "total": 3
        }, {
          "title": "The Water Weaver",
          "desc": "A princess cursed by water magic and a devilishly handsome pirate sail together to achieve their ambitions                    ",
          "price": 9,
          "count": 1,
          "total": 9
        }],
      "user": {
        "nickName": "chek_ist",
        "firstName": "Андрей",
        "lastName": "Заикин",
        "name": "Заикин Андрей",
        "email": null,
        "currency": "$",
        "picture": "https://pp.userapi.com/c638820/v638820031/3d637/miid7C5yFAU.jpg",
        "address": [
          {
            "streetAddress": "825 Dawson drive",
            "addressLine2": "Qwintry Suite 12-139801",
            "city": "Newark",
            "state": "Delaware",
            "zip": "19712",
            "country": "Saint Pierre and Miquelon"
          }]
      },
      "total": 21,
      "tax": 2.73,
      "grandTotal": 23.73
    }
  }, {}, (err, res) => {
    console.log(res)
  }
)
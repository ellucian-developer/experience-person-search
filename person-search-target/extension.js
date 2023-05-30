module.exports = {
    "name": "person-search-target",
    "publisher": "ranger",
    "cards": [{
        "type": "PersonSearchTargetCard",
        "source": "./src/cards/PersonSearchTargetCard",
        "title": "Person Search Target Card",
        "displayCardType": "Person Search Target Card",
        "description": "Card needed for a page",
        "pageRoute": {
            "route": "/profile/1"
        }
    }],
    "page": {
        "source": "./src/page/"
    }
}
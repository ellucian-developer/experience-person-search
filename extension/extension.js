module.exports = {
    "name": "person-search",
    "publisher": "ranger",
    "cards": [{
        "type": "PersonSearch",
        "source": "./src/cards/PersonSearch.jsx",
        "title": "Person Search",
        "displayCardType": "Person Search",
        "description": "Search for a person by name or ID",
        template: {
            icon: 'address-card',
            title: 'Person Search',
            description: 'Searches for persons in filtered roles and launches a page or URL'
        },
        customConfiguration: {
            source: './src/cards/PersonSearchConfiguration.jsx'
        }
    }]
}
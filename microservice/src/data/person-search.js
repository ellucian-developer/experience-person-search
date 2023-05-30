// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import { integrationUtil } from '@ellucian/experience-extension-server-util';

import { logUtil } from '@ellucian/experience-extension-server-util';
const logger = logUtil.getLogger();

function buildCriteria({searchRole, searchString, type}) {
    let criteria;
    let id;

    switch(type) {
    case 'ethosPersonId':
        id = searchString;
        break;
    case 'colleaguePersonId':
    case 'bannerId':
    case 'bannerUdcId':
    case 'bannerUserName':
        criteria = {
            credentials: [
                {
                    type: type,
                    value: searchString
                }
            ]
        };
        break;
    case 'names':
        {
            const [name1, name2, name3 ] = searchString.split(/\s+/);

            const nameCriteria = {};
            if (name3) {
                nameCriteria.firstName = name1;
                nameCriteria.middleName = name2;
                nameCriteria.lastName = name3;
            } else if (name2) {
                nameCriteria.firstName = name1;
                nameCriteria.lastName = name2;
            } else if (name1) {
                nameCriteria.lastName = name1;
            } else {
                return undefined;
            }

            criteria = {
                names: [ nameCriteria ]
            };

            // should we add the role filter?
            if (searchRole && searchRole !== '' && searchRole !== 'any') {
                criteria.roles = [
                    { role: searchRole }
                ];
            }
        }
        break;
    }

    return { criteria, id };
}

export async function fetchSearch ({ apiKey, erpIdentifier, searchResultsAttributes, searchRole, searchBy, searchString }) {
    try {
        const start = new Date();
        const ethosContext = {};

        if (!searchString || searchString === '') {
            return [];
        }

        // prime the token
        await integrationUtil.getToken({
            apiKey,
            context: ethosContext
        });

        // build a query for each search by
        const criterion = [];
        const searchPromises = [];
        const searchByTypes = Array.isArray(searchBy) ? searchBy : searchBy.split(/\s?,\s?/);
        for (const type of searchByTypes) {
            const { criteria, id } = buildCriteria({type, searchRole, searchString});
            if (criteria) {
                criterion.push(criteria);
                const searchParams = {
                    criteria
                };

                const options = {
                    apiKey,
                    context: ethosContext,
                    resource: 'persons',
                    searchParams
                };

                // console.log('options:', options)
                searchPromises.push(integrationUtil.get(options));
            } else
            if (id) {
                criterion.push({id});

                const options = {
                    apiKey,
                    context: ethosContext,
                    resource: 'persons',
                    id
                };

                // console.log('options:', options)
                searchPromises.push(integrationUtil.get(options));
            }
        }

        const searchResults = await Promise.all(searchPromises);

        let personsByGuid = {};
        let index = 0;
        for (const result of searchResults) {
            const { id: criteriaById } = criterion[index];
            if (criteriaById) {
                const { data: person, error } = result;

                if (error) {
                    console.error(`persons error by ID: ${JSON.stringify(criterion[index])}`);
                } else if (person) {
                    personsByGuid[person.id] = person;
                }
            } else {
                const { data: persons, error } = result;

                if (error) {
                    console.error(`persons error for criteria: ${JSON.stringify(criterion[index])}`);
                } else if (persons && Array.isArray(persons)) {
                    for (const person of persons) {
                        personsByGuid[person.id] = person;
                    }
                }
            }

            index++;
        }

        const persons = Array.from(Object.values(personsByGuid));

        let result;
        const transformedPersons = persons.map(person => {
            const { emails = [], credentials = [], names = []} = person;
            const preferredName = names.length > 0 ? names.find(name => name.preference === 'preferred') || names[0] : {};
            const transformedPerson = {
                id: person.id,
                names: preferredName,
            };

            searchResultsAttributes?.forEach(attribute => {
                switch(attribute) {
                case 'ethosPersonId':
                    // already covered
                    break;
                case 'birthDate':
                    transformedPerson.dateOfBirth = person.dateOfBirth;
                    break;
                case 'email':
                    {
                        const primaryEmail = emails.length > 0 ? emails.find(email => email.preference === 'primary') || emails[0] : {};
                        transformedPerson.email = primaryEmail.address;
                    }
                    break;
                default:
                    // credentials
                    transformedPerson[attribute] = credentials?.length > 0 ? credentials.find(credential => credential.type === attribute)?.value : undefined;
                    break;
                }
            });

            // ensure the erpIdentifier is returned
            if (erpIdentifier && erpIdentifier !== 'ethosPersonId') {
                if (!transformedPerson[erpIdentifier]) {
                    transformedPerson[erpIdentifier] = credentials?.length > 0 ? credentials.find(credential => credential.type === erpIdentifier)?.value : undefined;
                }
            }

            return transformedPerson;
        });

        result = transformedPersons;

        // sort by last name then first name
        result.sort((a, b) => {
            const lastNameCompare = a.names.lastName.localeCompare(b.names.lastName);
            return lastNameCompare === 0 ?
                a.names.firstName.localeCompare(b.names.firstName) : lastNameCompare;
        });

        logger.debug('GET time:', new Date().getTime() - start.getTime());
        logger.debug('Ethos GET count:', ethosContext.ethosGetCount);
        return result;
    } catch (error) {
        logger.error('unable to fetch data sources: ', error);
        return { data: [], error: error.message };
    }
}

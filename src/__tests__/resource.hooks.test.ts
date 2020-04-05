
import axios from 'axios';
import { useSelector } from 'react-redux';

import configureMockStore from "redux-mock-store";
import { renderHook } from '@testing-library/react-hooks';
import { mocked } from 'ts-jest/dist/util/testing';

import { Course } from './helpers/CourseHook';
import { getAction } from './helpers/global';
import { JsonApiRequestConfig } from 'lib/types';
import { IRequestParams } from 'index';

/**
 * Mock axios and redux
 */
jest.mock("axios");
jest.mock("react-redux", () => ({
    useSelector: jest.fn()
}));

describe('Resource Hooks', () => {
    let store: any;
    beforeEach(() => {
        let mockStore = configureMockStore();
        store = mockStore({ resources: {} });
    });

    it('(fetches resources using fetchAll) should call redux action with payload', async () => {
        // Arrange
        const response = {
            data: {
                "links": {
                    "self": "http://localhost:5000/api/v1/jobTitles"
                },
                "data": []
            },
            status: 200,
            statusText: "OK",
            config: {},
            headers: {}
        };

        const action = {
            "type": "FETCH_RESOURCES_SUCCESS", "payload": {
                meta: {
                    courses: {
                        data: [], links: {
                            "self": "http://localhost:5000/api/v1/jobTitles"
                        }
                    }
                }
            }
        };

        mocked(axios).mockResolvedValue(response);
        useSelector.mockImplementation(callback => {
            return callback({ api: { resources: {} } });
        });

        // Act
        renderHook(
            () => Course.fetchAll(store),
        );
        const parsedAction = await getAction(store, "FETCH_RESOURCES_SUCCESS");

        // Assert
        expect(parsedAction).toEqual(action);
    });

    it('(fetches a resource using fetch) should call redux action with payload', async () => {
        // Arrange
        const response = {
            data: {
                "links": {
                    "self": "http://localhost:5000/api/v1/jobTitles"
                },
                "data": []
            },
            status: 200,
            statusText: "OK",
            config: {},
            headers: {}
        };

        const action = {
            "type": "FETCH_RESOURCES_SUCCESS", "payload": {
                meta: {
                    "courses/1": {
                        data: [], links: {
                            "self": "http://localhost:5000/api/v1/jobTitles"
                        }
                    }
                }
            }
        };

        mocked(axios).mockResolvedValue(response);
        useSelector.mockImplementation(callback => {
            return callback({ api: { resources: {} } });
        });

        // Act
        renderHook(
            () => Course.fetch(store, 1),
        );
        const parsedAction = await getAction(store, "FETCH_RESOURCES_SUCCESS");

        // Assert
        expect(parsedAction).toEqual(action);
    });

    it('(fetches resources using useResources hook) should populate resources', async () => {
        // Arrange
        const response = {
            data: {
                "links": {
                    "self": "http://localhost:5000/api/v1/jobTitles"
                },
                "data": []
            },
            status: 200,
            statusText: "OK",
            config: {},
            headers: {}
        };

        mocked(axios).mockResolvedValue(response);

        // Act
        const requestParams: IRequestParams = {
            filter: "banana",
            page: {
                size: 10,
                number: 1
            },

        }
        const { result } = renderHook(
            () => Course.useResources(store, requestParams),
        );
        await getAction(store, "FETCH_RESOURCES_SUCCESS");

        // Assert
        expect(result.current).toEqual([]);
    });
});
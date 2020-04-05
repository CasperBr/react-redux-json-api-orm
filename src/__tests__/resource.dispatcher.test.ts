import configureMockStore from "redux-mock-store";
import { getAction } from "./helpers/global";
import axios from 'axios';
import { mocked } from "ts-jest/dist/util/testing";
import { Course } from './helpers/CourseDispatcher';

jest.mock("axios");

describe("Resource dispatcher", () => {
  let store: any;
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

  beforeEach(() => {
    let mockStore = configureMockStore();
    store = mockStore({ resources: {} });
  });

  it("(fetches resources using fetchAll) should call redux action with payload", async () => {
    // Arrange
    mocked(axios).mockResolvedValue(response);

    // Act
    await Course.fetchAll(store);

    // Assert
    const parsedAction = await getAction(store, "FETCH_RESOURCES_SUCCESS");
    expect(parsedAction).toEqual(action);
  });
});

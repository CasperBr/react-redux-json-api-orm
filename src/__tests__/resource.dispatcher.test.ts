import configureMockStore from "redux-mock-store";
import { getAction } from "./helpers/global";
import axios from 'axios';
import { mocked } from "ts-jest/dist/util/testing";
import { Course } from './helpers/CourseDispatcher';

jest.mock("axios");

describe("Fetch API actions", () => {
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

    // const AUTH_TOKEN = "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbkBhZG1pbi5ubCIsIm5iZiI6MTU4NjAyNjMxMSwiZXhwIjoxNTg2MTEyNzExLCJpYXQiOjE1ODYwMjYzMTF9.vUc7ZK9lf0PvhFHVnIUY6391om122QpeO2gxp4_7JtiVeaSBtpjzX5NrIDz3FvJPKZ9DpV3RandcPoEZS52M9g";
    // axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
    // axios.defaults.baseURL = 'http://localhost:5000/api/v1';
  });

  it("(fetches reports) should call FETCH_API_REQUEST", async () => {
    // Arrange


    mocked(axios).mockResolvedValue(response);

    // Act
    await Course.fetchAll(store);

    // Assert
    const parsedAction = await getAction(store, "FETCH_RESOURCES_SUCCESS");
    expect(parsedAction).toEqual(action);
  });
});

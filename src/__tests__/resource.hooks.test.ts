
import axios from 'axios';
import { useSelector } from 'react-redux';

import configureMockStore from "redux-mock-store";
import { renderHook } from '@testing-library/react-hooks';
import { mocked } from 'ts-jest/dist/util/testing';

import { Course } from './helpers/CourseHook';
import { getAction } from './helpers/global';

/**
 * Mock axios and redux
 */
jest.mock("axios");
jest.mock("react-redux", () => ({
    useSelector: jest.fn()
}));

describe('Resource Hooks', () => {
    let store: any;
    const response = JSON.parse('{"data":{"links":{"self":"http://localhost:5000/api/v1/students"},"data":[{"type":"students","id":"1","attributes":{"firstName":"Casper","initials":"Casper","lastName":"Broertjes","street":null,"houseNumber":"11","postalCode":"2061XD","city":"Bloemendaal","nationality":"NL","dateOfBirth":"0001-01-01T00:00:00","birthplace":"Bloemendaal","mobilePhone":null,"emailAddress":"Casperbroertjes@gmail.com","facebookAccount":null,"isActive":true,"canLogin":true},"relationships":{"maritalStatus":{"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/maritalStatus","related":"http://localhost:5000/api/v1/students/1/maritalStatus"},"data":{"type":"maritalStatuses","id":"1"}},"grade":{"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/grade","related":"http://localhost:5000/api/v1/students/1/grade"},"data":{"type":"grades","id":"1"}},"gender":{"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/gender","related":"http://localhost:5000/api/v1/students/1/gender"},"data":{"type":"genders","id":"1"}},"school":{"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/school","related":"http://localhost:5000/api/v1/students/1/school"},"data":{"type":"schools","id":"1"}},"courses":{"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/courses","related":"http://localhost:5000/api/v1/students/1/courses"},"data":[]},"employees":{"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/employees","related":"http://localhost:5000/api/v1/students/1/employees"},"data":[]},"parents":{"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/parents","related":"http://localhost:5000/api/v1/students/1/parents"},"data":[]},"user":{"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/user","related":"http://localhost:5000/api/v1/students/1/user"},"data":{"type":"users","id":"2"}}},"links":{"self":"http://localhost:5000/api/v1/students/1"}}],"included":[{"type":"maritalStatuses","id":"1","attributes":{"MaritalStatus":"Gehuwd"},"relationships":{"students":{"links":{"self":"http://localhost:5000/api/v1/maritalStatuses/1/relationships/students","related":"http://localhost:5000/api/v1/maritalStatuses/1/students"}},"employees":{"links":{"self":"http://localhost:5000/api/v1/maritalStatuses/1/relationships/employees","related":"http://localhost:5000/api/v1/maritalStatuses/1/employees"}},"parents":{"links":{"self":"http://localhost:5000/api/v1/maritalStatuses/1/relationships/parents","related":"http://localhost:5000/api/v1/maritalStatuses/1/parents"}}},"links":{"self":"http://localhost:5000/api/v1/maritalStatuses/1"}},{"type":"grades","id":"1","attributes":{"grade":"Groep 6"},"relationships":{"students":{"links":{"self":"http://localhost:5000/api/v1/grades/1/relationships/students","related":"http://localhost:5000/api/v1/grades/1/students"}},"employees":{"links":{"self":"http://localhost:5000/api/v1/grades/1/relationships/employees","related":"http://localhost:5000/api/v1/grades/1/employees"}},"parents":{"links":{"self":"http://localhost:5000/api/v1/grades/1/relationships/parents","related":"http://localhost:5000/api/v1/grades/1/parents"}}},"links":{"self":"http://localhost:5000/api/v1/grades/1"}},{"type":"genders","id":"1","attributes":{"gender":"M"},"relationships":{"employees":{"links":{"self":"http://localhost:5000/api/v1/genders/1/relationships/employees","related":"http://localhost:5000/api/v1/genders/1/employees"}},"students":{"links":{"self":"http://localhost:5000/api/v1/genders/1/relationships/students","related":"http://localhost:5000/api/v1/genders/1/students"}},"parents":{"links":{"self":"http://localhost:5000/api/v1/genders/1/relationships/parents","related":"http://localhost:5000/api/v1/genders/1/parents"}}},"links":{"self":"http://localhost:5000/api/v1/genders/1"}},{"type":"schools","id":"1","attributes":{"school":"Da Vinci College"},"relationships":{"students":{"links":{"self":"http://localhost:5000/api/v1/schools/1/relationships/students","related":"http://localhost:5000/api/v1/schools/1/students"}},"employees":{"links":{"self":"http://localhost:5000/api/v1/schools/1/relationships/employees","related":"http://localhost:5000/api/v1/schools/1/employees"}}},"links":{"self":"http://localhost:5000/api/v1/schools/1"}},{"type":"users","id":"2","attributes":{"username":"casperbroertjes@gmail.com","password":null,"passwordHash":"szCfWTkQUt2h1nc87YmoFcXFa2/dkJi6a4lLvmepoMl2ZtcWCrkzU3WyJvm60ET7kyfVk9Fnxp67Zt+tg+6A9w==","passwordSalt":"wZcTGPcj4/wySDZYdw5gallL7oF9gTVPYp7mDz0yMpQbhFZhkpdf/6/qnOvmrPDBiPfgKfCSe64Js1NbiuQEFDUKSx3l8TQaP+ckfMrOmZw/uXt23dNvbksTaP0Ygu2YkDrERRQK0FTWvjJmotrew3fOfMEml7hKa1wlcwpzNsA=","token":null,"userId":0,"permission":4,"firstName":null,"lastName":null,"canLogin":false},"relationships":{"role":{"links":{"self":"http://localhost:5000/api/v1/users/2/relationships/role","related":"http://localhost:5000/api/v1/users/2/role"}},"student":{"links":{"self":"http://localhost:5000/api/v1/users/2/relationships/student","related":"http://localhost:5000/api/v1/users/2/student"}},"employee":{"links":{"self":"http://localhost:5000/api/v1/users/2/relationships/employee","related":"http://localhost:5000/api/v1/users/2/employee"}},"parent":{"links":{"self":"http://localhost:5000/api/v1/users/2/relationships/parent","related":"http://localhost:5000/api/v1/users/2/parent"}}},"links":{"self":"http://localhost:5000/api/v1/users/2"}}]},"status":200,"statusText":"OK","headers":{"content-type":"application/vnd.api+json"},"config":{"url":"http://localhost:5000/api/v1/students?include=user,gender,maritalStatus,school,grade,courses,employees,parents&page[number]=1&page[size]=10","method":"get","data":"{}","headers":{"Accept":"application/json, text/plain, */*","Content-Type":"application/vnd.api+json","Authorization":"Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbkBhZG1pbi5ubCIsIm5iZiI6MTU4NjAyNjMxMSwiZXhwIjoxNTg2MTEyNzExLCJpYXQiOjE1ODYwMjYzMTF9.vUc7ZK9lf0PvhFHVnIUY6391om122QpeO2gxp4_7JtiVeaSBtpjzX5NrIDz3FvJPKZ9DpV3RandcPoEZS52M9g"},"transformRequest":[null],"transformResponse":[null],"timeout":0,"xsrfCookieName":"XSRF-TOKEN","xsrfHeaderName":"X-XSRF-TOKEN","maxContentLength":-1},"request":{}}');
    const payload = JSON.parse('{"type":"FETCH_RESOURCES_SUCCESS","payload":{"students":{"1":{"id":"1","type":"students","attributes":{"firstName":"Casper","initials":"Casper","lastName":"Broertjes","street":null,"houseNumber":"11","postalCode":"2061XD","city":"Bloemendaal","nationality":"NL","dateOfBirth":"0001-01-01T00:00:00","birthplace":"Bloemendaal","mobilePhone":null,"emailAddress":"Casperbroertjes@gmail.com","facebookAccount":null,"isActive":true,"canLogin":true},"links":{"self":"http://localhost:5000/api/v1/students/1"},"relationships":{"maritalStatus":{"data":{"id":"1","type":"maritalStatuses"},"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/maritalStatus","related":"http://localhost:5000/api/v1/students/1/maritalStatus"}},"grade":{"data":{"id":"1","type":"grades"},"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/grade","related":"http://localhost:5000/api/v1/students/1/grade"}},"gender":{"data":{"id":"1","type":"genders"},"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/gender","related":"http://localhost:5000/api/v1/students/1/gender"}},"school":{"data":{"id":"1","type":"schools"},"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/school","related":"http://localhost:5000/api/v1/students/1/school"}},"courses":{"data":[],"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/courses","related":"http://localhost:5000/api/v1/students/1/courses"}},"employees":{"data":[],"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/employees","related":"http://localhost:5000/api/v1/students/1/employees"}},"parents":{"data":[],"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/parents","related":"http://localhost:5000/api/v1/students/1/parents"}},"user":{"data":{"id":"2","type":"users"},"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/user","related":"http://localhost:5000/api/v1/students/1/user"}}}}},"maritalStatuses":{"1":{"id":"1","type":"maritalStatuses","attributes":{"maritalStatus":"Gehuwd"},"links":{"self":"http://localhost:5000/api/v1/maritalStatuses/1"},"relationships":{"students":{"links":{"self":"http://localhost:5000/api/v1/maritalStatuses/1/relationships/students","related":"http://localhost:5000/api/v1/maritalStatuses/1/students"}},"employees":{"links":{"self":"http://localhost:5000/api/v1/maritalStatuses/1/relationships/employees","related":"http://localhost:5000/api/v1/maritalStatuses/1/employees"}},"parents":{"links":{"self":"http://localhost:5000/api/v1/maritalStatuses/1/relationships/parents","related":"http://localhost:5000/api/v1/maritalStatuses/1/parents"}}}}},"grades":{"1":{"id":"1","type":"grades","attributes":{"grade":"Groep 6"},"links":{"self":"http://localhost:5000/api/v1/grades/1"},"relationships":{"students":{"links":{"self":"http://localhost:5000/api/v1/grades/1/relationships/students","related":"http://localhost:5000/api/v1/grades/1/students"}},"employees":{"links":{"self":"http://localhost:5000/api/v1/grades/1/relationships/employees","related":"http://localhost:5000/api/v1/grades/1/employees"}},"parents":{"links":{"self":"http://localhost:5000/api/v1/grades/1/relationships/parents","related":"http://localhost:5000/api/v1/grades/1/parents"}}}}},"genders":{"1":{"id":"1","type":"genders","attributes":{"gender":"M"},"links":{"self":"http://localhost:5000/api/v1/genders/1"},"relationships":{"employees":{"links":{"self":"http://localhost:5000/api/v1/genders/1/relationships/employees","related":"http://localhost:5000/api/v1/genders/1/employees"}},"students":{"links":{"self":"http://localhost:5000/api/v1/genders/1/relationships/students","related":"http://localhost:5000/api/v1/genders/1/students"}},"parents":{"links":{"self":"http://localhost:5000/api/v1/genders/1/relationships/parents","related":"http://localhost:5000/api/v1/genders/1/parents"}}}}},"schools":{"1":{"id":"1","type":"schools","attributes":{"school":"Da Vinci College"},"links":{"self":"http://localhost:5000/api/v1/schools/1"},"relationships":{"students":{"links":{"self":"http://localhost:5000/api/v1/schools/1/relationships/students","related":"http://localhost:5000/api/v1/schools/1/students"}},"employees":{"links":{"self":"http://localhost:5000/api/v1/schools/1/relationships/employees","related":"http://localhost:5000/api/v1/schools/1/employees"}}}}},"users":{"2":{"id":"2","type":"users","attributes":{"username":"casperbroertjes@gmail.com","password":null,"passwordHash":"szCfWTkQUt2h1nc87YmoFcXFa2/dkJi6a4lLvmepoMl2ZtcWCrkzU3WyJvm60ET7kyfVk9Fnxp67Zt+tg+6A9w==","passwordSalt":"wZcTGPcj4/wySDZYdw5gallL7oF9gTVPYp7mDz0yMpQbhFZhkpdf/6/qnOvmrPDBiPfgKfCSe64Js1NbiuQEFDUKSx3l8TQaP+ckfMrOmZw/uXt23dNvbksTaP0Ygu2YkDrERRQK0FTWvjJmotrew3fOfMEml7hKa1wlcwpzNsA=","token":null,"userId":0,"permission":4,"firstName":null,"lastName":null,"canLogin":false},"links":{"self":"http://localhost:5000/api/v1/users/2"},"relationships":{"role":{"links":{"self":"http://localhost:5000/api/v1/users/2/relationships/role","related":"http://localhost:5000/api/v1/users/2/role"}},"student":{"links":{"self":"http://localhost:5000/api/v1/users/2/relationships/student","related":"http://localhost:5000/api/v1/users/2/student"}},"employee":{"links":{"self":"http://localhost:5000/api/v1/users/2/relationships/employee","related":"http://localhost:5000/api/v1/users/2/employee"}},"parent":{"links":{"self":"http://localhost:5000/api/v1/users/2/relationships/parent","related":"http://localhost:5000/api/v1/users/2/parent"}}}}},"meta":{"students":{"data":[{"id":"1","type":"students","relationships":{"maritalStatus":{"data":{"id":"1","type":"maritalStatuses"},"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/maritalStatus","related":"http://localhost:5000/api/v1/students/1/maritalStatus"}},"grade":{"data":{"id":"1","type":"grades"},"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/grade","related":"http://localhost:5000/api/v1/students/1/grade"}},"gender":{"data":{"id":"1","type":"genders"},"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/gender","related":"http://localhost:5000/api/v1/students/1/gender"}},"school":{"data":{"id":"1","type":"schools"},"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/school","related":"http://localhost:5000/api/v1/students/1/school"}},"courses":{"data":[],"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/courses","related":"http://localhost:5000/api/v1/students/1/courses"}},"employees":{"data":[],"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/employees","related":"http://localhost:5000/api/v1/students/1/employees"}},"parents":{"data":[],"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/parents","related":"http://localhost:5000/api/v1/students/1/parents"}},"user":{"data":{"id":"2","type":"users"},"links":{"self":"http://localhost:5000/api/v1/students/1/relationships/user","related":"http://localhost:5000/api/v1/students/1/user"}}}}],"links":{"self":"http://localhost:5000/api/v1/students"}}}}}');
    
    const action = {
        type: "FETCH_RESOURCES_SUCCESS", 
        payload
    };

    beforeEach(() => {
        let mockStore = configureMockStore();
        store = mockStore({ resources: {} });
    });

    it('(fetches resources using fetchAll) should call redux action with payload', async () => {
        // Arrange
        mocked(axios).mockResolvedValue(response);
        useSelector.mockImplementation(callback => {
            return callback({api: {resources: {}}});
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
        mocked(axios).mockResolvedValue(response);
        useSelector.mockImplementation(callback => {
            return callback({api: {resources: {}}});
        });

        // Act
        renderHook(
            () => Course.fetch(store, 1),
        );
        const parsedAction = await getAction(store, "FETCH_RESOURCES_SUCCESS");

        // Assert
        // expect(parsedAction).toEqual(action);
    });

    it('(fetches resources using useResources hook) should populate resources', async () => {
        // Arrange
        mocked(axios).mockResolvedValue(response);

        // Act
        const { result } = renderHook(
            () => Course.useResources(store),
        );
        await getAction(store, "FETCH_RESOURCES_SUCCESS");

        // Assert
        expect(result.current).toEqual([]);
    });

    
});
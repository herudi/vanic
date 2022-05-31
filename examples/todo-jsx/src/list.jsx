/* @jsx h */
import { h, Fragment } from "vanic";

export const List = ({ items, onDelete }) => {
  return (
    <Fragment>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Act</th>
          </tr>
        </thead>
        <tbody>
          {
            items.map((item, id) => {
              return (
                <tr>
                  <td>{id + 1}</td>
                  <td>{item.name}</td>
                  <td>
                    <button onClick={() => onDelete(item.key)}>delete</button>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>

    </Fragment>
  )
}
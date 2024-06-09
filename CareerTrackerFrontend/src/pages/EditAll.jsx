import React, { useState, useEffect } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Selection, Inject, Edit, Toolbar, Sort, Filter } from '@syncfusion/ej2-react-grids';
import { editGrid } from '../data/menu';
import { useStateContext } from '../contexts/ContextProvider';

const EditAll = () => {
  const { currentColor } = useStateContext();
  const [dataSource, setDataSource] = useState([]);
  const selectionsettings = { persistSelection: true };
  const toolbarOptions = ['Delete'];
  const editing = { allowDeleting: true, allowEditing: true };

  const fetchData = () => {
    fetch('/api/logins')
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.map((row) => ({
          Email: row[1],
          Password: row[2],
          Website: row[3],
          DatabaseID: row[0],
        }));
        setDataSource(formattedData);
      })
      .catch((error) => console.error('Error fetching data:', error));
  };

  const updateRecords = (updatedRecords) => {
    fetch('/api/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updatedRecords }),
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to update records:', response.statusText);
        }
      })
      .catch((error) => console.error('Error updating records:', error));
  };

  const deleteRecord = (deletedRecords) => {
    fetch('/api/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deletedIds: deletedRecords }),
    })
      .then((response) => {
        if (response.ok) {
          setDataSource(dataSource.filter((item) => !deletedRecords.includes(item.DatabaseID)));
        } else {
          console.error('Failed to delete records:', response.statusText);
        }
      })
      .catch((error) => console.error('Error deleting records:', error));
  };

  const handleActionBegin = (args) => {
    console.log(args.requestType);
    console.log(args.data);
    if (args.requestType === 'delete') {
      console.log('Delete action triggered');
      deleteRecord(Array.isArray(args.data) ? args.data.map((record) => record.DatabaseID) : [args.data.DatabaseID]);
    } else if ((args.requestType) === 'save') {
      console.log('Save action triggered');
      const updatedRecords = Array.isArray(args.data) ? args.data.filter((record) => record.isDirty) : [args.data];
      console.log('Updated records:', updatedRecords);
      if (updatedRecords.length > 0) {
        console.log('Sending PATCH request');
        updateRecords(updatedRecords);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <h1 style={{ color: currentColor, fontSize: '2rem', marginBottom: '10px' }} className="font-bold">Edit Your Credentials</h1>
      <GridComponent
        dataSource={dataSource}
        allowPaging
        pageSettings={{ pageCount: 5 }}
        selectionSettings={selectionsettings}
        toolbar={toolbarOptions}
        editSettings={editing}
        allowSorting
        actionBegin={handleActionBegin}
      >
        <ColumnsDirective>
          {editGrid.map((column, index) => (
            <ColumnDirective
              key={index}
              headerText={column.headerText}
              field={column.field}
              width={column.width}
              textAlign={column.textAlign}
              type={column.type}
              isPrimaryKey={column.isPrimaryKey}
            />
          ))}
        </ColumnsDirective>
        <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default EditAll;

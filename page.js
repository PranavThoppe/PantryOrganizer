'use client'

import { useState, useEffect, useRef } from 'react';
import { firestore } from './firebase';
import { Box, Stack, Typography, Button, ButtonGroup, Popover, TextField } from '@mui/material';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

export default function Home() {
  const [pantry, setPantry] = useState([]); // State to hold the list of pantry items
  const [anchorEl, setAnchorEl] = useState(null); // For Add Popover
  const [updateAnchorEl, setUpdateAnchorEl] = useState(null); // For Update Popover
  const [itemName, setItemName] = useState(''); // State to hold the name of the item to be added
  const [selectedItem, setSelectedItem] = useState(null); // State to hold the currently selected item
  const [newItemName, setNewItemName] = useState(''); // State to hold the new name for updating an item
  const [searchQuery, setSearchQuery] = useState(''); // State to hold the search query

  // Create a ref to store item references for scrolling
  const itemRefs = useRef({});

  useEffect(() => {
    const updatePantry = async () => {
      const snapshot = query(collection(firestore, 'Pantry'));
      const docs = await getDocs(snapshot);
      const pantryList = [];
      docs.forEach((doc) => {
        pantryList.push(doc.id);
      });
      console.log(pantryList);
      setPantry(pantryList);
    };
    updatePantry();
  }, []);

  // Scroll to the selected item when it changes
  useEffect(() => {
    if (selectedItem && itemRefs.current[selectedItem]) {
      itemRefs.current[selectedItem].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedItem]);

  // Handle Add button click to open the Add Popover
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close the Add Popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Add a new item to the pantry
  const addPantryItem = async () => {
    try {
      const newItemName = itemName.trim();
      if (newItemName) {
        const newItem = {
          name: newItemName,
          createdAt: new Date()
        };

        const docRef = doc(collection(firestore, 'Pantry'), newItemName);
        await setDoc(docRef, newItem);

        console.log("Document written with ID: ", newItemName);

        setPantry([...pantry, newItemName]); // Update the pantry list with the new item
        setItemName(''); // Clear the input field
        handleClose(); // Close the popover
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Delete the selected item from the pantry
  const deletePantryItem = async () => {
    try {
      if (selectedItem) {
        const docRef = doc(firestore, 'Pantry', selectedItem);
        await deleteDoc(docRef);

        console.log("Document deleted with ID: ", selectedItem);

        setPantry(pantry.filter((item) => item !== selectedItem)); // Update the pantry list
        setSelectedItem(null); // Clear the selected item
      }
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  // Handle Update button click to open the Update Popover
  const handleUpdateClick = (event) => {
    setUpdateAnchorEl(event.currentTarget);
    setNewItemName(selectedItem); // Set the current name for updating
  };

  // Close the Update Popover
  const handleUpdateClose = () => {
    setUpdateAnchorEl(null);
  };

  const updateOpen = Boolean(updateAnchorEl);
  const updateId = updateOpen ? 'update-popover' : undefined;

  // Update the selected item with a new name
  const UpdatePantryItem = async () => {
    try {
      const trimmedNewItemName = newItemName.trim();
      if (trimmedNewItemName && selectedItem) {
        const oldDocRef = doc(firestore, 'Pantry', selectedItem);
        const newDocRef = doc(firestore, 'Pantry', trimmedNewItemName);

        const oldDocSnap = await getDoc(oldDocRef);
        if (oldDocSnap.exists()) {
          await setDoc(newDocRef, { ...oldDocSnap.data(), name: trimmedNewItemName });
          await deleteDoc(oldDocRef);

          console.log("Document updated with ID: ", trimmedNewItemName);

          setPantry(pantry.map((item) => (item === selectedItem ? trimmedNewItemName : item))); // Update the pantry list
          setSelectedItem(trimmedNewItemName); // Update the selected item
          setNewItemName(''); // Clear the input field
          handleUpdateClose(); // Close the popover
        }
      }
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  // Handle search button click to select the item that matches the search query
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (pantry.includes(trimmedQuery)) {
      setSelectedItem(trimmedQuery); // Set the selected item to the search result
    } else {
      setSelectedItem(null); // Clear selection if no match
    }
  };

  const crudButtons = [
    <Button key="Add" onClick={handleClick} style={{ width: '100%', backgroundColor: 'green', border: '5px solid Black', color: 'white' }}>Add</Button>,
    <Button key="Delete" onClick={deletePantryItem} style={{ width: '100%', backgroundColor: 'red', border: '5px solid Black', color: 'white' }}>Delete</Button>,
    <Button key="Update" onClick={handleUpdateClick} style={{ width: '100%', backgroundColor: 'gray', border: '5px solid Black', color: 'white' }}>Update</Button>,
  ];

  return (
    <Box
      width={'100vw'}
      height={'100vh'}
      display={'flex'}
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={'column'}
    >
      {/* Add Popover */}
      <Popover
        id="add-popover"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Typography sx={{ p: 2 }}>
          <TextField
            id="outlined-basic"
            label="Enter Pantry Item"
            variant="outlined"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </Typography>
        <Button onClick={addPantryItem}>Add</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Popover>

      {/* Update Popover */}
      <Popover
        id={updateId}
        open={updateOpen}
        anchorEl={updateAnchorEl}
        onClose={handleUpdateClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Typography sx={{ p: 2 }}>
          <TextField
            id="update-item-name"
            label="Update Pantry Item"
            variant="outlined"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </Typography>
        <Button onClick={UpdatePantryItem}>Update</Button>
        <Button onClick={handleUpdateClose}>Cancel</Button>
      </Popover>

      <Box
        width={'800px'}
        display={'flex'}
      >
        <Typography
          variant="h1"
          align='center'
          bgcolor={'beige'}
          color={"black"}
          padding={'10px'}
          borderTop={'5px solid Black'}
          borderLeft={'5px solid Black'}
          width={'100%'}
        >
          Pantry
        </Typography>

        <ButtonGroup orientation="vertical" aria-label="Vertical button group" height='100%' width='100px'>
          {crudButtons.map((button, index) => (
            <Box key={index} style={{ flex: 1, display: 'flex', width: '100px' }}>
              {button}
            </Box>
          ))}
        </ButtonGroup>
      </Box>

      <Stack
        width={'800px'}
        maxHeight={'400px'}
        overflow={'scroll'}
        spacing={2}
        border={'5px solid Black'}
        position={'relative'}
      >
        <Box
          position={'sticky'}
          zIndex={1}
          top={0}
          left={0}
          bgcolor={'transparent'} // Ensures the TextField box has a background
          display={'flex'}
          margin-top={'10px'}
        >
          <TextField
            id="search-item"
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            style={{
              border: '2px solid gray',
              marginLeft: '10px' // Add some space between the TextField and Button
            }}
            onClick={handleSearch}
          >
            🔍
          </Button>
        </Box>

        {/* Render pantry items */}
        {pantry.map((i) => (
          <Box
            key={i}
            width={'100%'}
            minHeight={'150px'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={'8px'}
            onClick={() => {
              // Toggle selection
              setSelectedItem(selectedItem === i ? null : i);
            }}
            bgcolor={selectedItem === i ? '#ddffff' : '#f0f0f0'}
            style={{ cursor: 'pointer' }}
            padding={'10px'}
            ref={(el) => (itemRefs.current[i] = el)} // Assign ref to the item element
          >
            <Typography variant="h4">
              {i.charAt(0).toUpperCase() + i.slice(1)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

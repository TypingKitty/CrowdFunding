import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Assuming you're using a button component


const CustomDialog = ({TriggerElement, submitHandler, title,contentComponents}) => {

  if (!components || components.length < 3) {
    console.error(
      "CustomDialog requires at least 3 components: [Trigger, handleSubmit, Title]"
    );
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{TriggerElement}</DialogTrigger>
      <DialogContent className="bg-gray-100 p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription >
          {contentComponents.map((Component, index) =>
              <div key={index}>{Component}</div>
          )}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={submitHandler}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;

import {
  Button,
  Modal,
  Input,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Form,
  FormGroup,
  Label,
} from "reactstrap";
import Dropzone from "./Dropzone";
import styles from "./UploadModal.module.css";
import Select, { components, MultiValueGenericProps } from "react-select";
import { useEffect, useState } from "react";
import { upload } from "./tus";

interface MemberOption {
  readonly value: string;
  readonly label: string;
  readonly image: string;
}

const memberOptions: readonly MemberOption[] = [
  { value: "boneless", label: "Adam Neulight", image: "photos/boneless.png" },
  { value: "lontronix", label: "Lonnie Gerol", image: "photos/lontronix.jpg" },
  { value: "mattyb", label: "Matthew Breidenbach", image: "photos/mattyb.png" },
  { value: "mstrodl", label: "Mary Strodl", image: "photos/mstrodl.png" },
  { value: "pixel", label: "Cecilia Lau", image: "photos/pixel.png" },
  { value: "wilnil", label: "Willard Nilges", image: "photos/wilnil.png" },
];

const MultiValueLabel = (props: MultiValueGenericProps<MemberOption>) => {
  return (
    <div className={styles["multi-value-label"]}>
      <img className={styles["member-circle"]} src={props.data.image} />
      <components.MultiValueLabel {...props} />
    </div>
  );
};

function TaggedMemberList() {
  return (
    <Select
      closeMenuOnSelect={false}
      components={{ MultiValueLabel }}
      styles={{
        multiValueLabel: (base) => ({
          ...base,
          display: "inline",
        }),
        control: (base) => ({
          ...base,
          "background-color": "transparent",
          border: "none",
        }),
      }}
      isMulti
      options={memberOptions}
    />
  );
}

interface FileMetaData {
  name: string;
  description: string;
}

/**
 * Additional metadata associated with an uploaded file needs to be stored, like its name (which can change),
 * file description and associated CSHers
 */
interface UploadedFile {
  metadata: FileMetaData;
  fileRef: File;
}

function FileListItem(props: {
  uploadedFile: UploadedFile;
  setMetadata: (metadata: FileMetaData) => void;
  onRemove: () => void;
}) {
  return (
    <Form className={styles["file-list-item"]}>
      <img
        className={styles["preview-image"]}
        src={URL.createObjectURL(props.uploadedFile.fileRef)}
      />
      <FormGroup>
        <Label>File Name</Label>
        <Input
          value={props.uploadedFile.metadata.name}
          onChange={(e) => {
            props.setMetadata({
              ...props.uploadedFile.metadata,
              name: e.target.value,
            });
          }}
          className={styles["file-name-input"]}
          type="text"
          placeholder="Welcome-Back-2023.png"
        />
      </FormGroup>
      <FormGroup>
        <Label>File Description</Label>
        <Input
          value={props.uploadedFile.metadata.description}
          onChange={(e) => {
            props.setMetadata({
              ...props.uploadedFile.metadata,
              description: e.target.value,
            });
          }}
          className={styles["file-description-input"]}
          placeholder="A group photo at Welcome Back 2023"
          type="textarea"
        />
      </FormGroup>
      <hr />
      <FormGroup>
        <Label>Members</Label>
        <TaggedMemberList />
      </FormGroup>
      <Button color="danger" onClick={() => props.onRemove()}>
        Remove
      </Button>
    </Form>
  );
}

export default function UploadModal({ isOpen }) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // removes a file from the list of uploaded files
  const removeFile = (file: UploadedFile) => {
    setUploadedFiles(
      uploadedFiles.filter((currFile) => {
        return file !== currFile;
      })
    );
  };

  // adds new files to the list of uploaded files
  const onFilesUploaded = (files: File[]) => {
    // TODO: somehow handle duplicate files
    const newFiles = files.map((file) => {
      return { metadata: { name: file.name, description: "" }, fileRef: file };
    });

    setUploadedFiles(uploadedFiles.concat(newFiles));
  };

  const [things, setThings] = useState<string[]>([]);
  const [progress, setProgress] = useState<{
    totalThings?: number;
    remainingThings?: number;
  }>({});

  function uploadThings(things: string[]) {
    setThings(things);
    setProgress({ totalThings: things.length, remainingThings: things.length });
  }

  // this effect will run any time the length of `things` changes
  useEffect(() => {
    if (things.length == 0) return;
    const [curThing] = things;

    // do something with curThings

    setThings(things.slice(1));

    // update progress

    setProgress(({ remainingThings, totalThings }) => {
      if (
        typeof remainingThings == "undefined" ||
        typeof totalThings == "undefined"
      )
        return { remainingThings, totalThings };
      else return { totalThings, remainingThings: remainingThings - 1 };
    });
  }, [things.length]);

  const uploadFiles = () => {
    console.log(`User wants to upload ${uploadedFiles.length} files.`);
    console.log(uploadedFiles);

    uploadFiles.forEach((file) => {
      // do something with file
    });

    setUploadedFiles([]);

    // while (uploadedFiles.length != 0) {
    //     console.log(uploadedFiles.length)
    //     setUploadedFiles(uploadedFiles.filter((_, i) => i !== 0));
    // }
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalHeader>Upload Media</ModalHeader>
      <ModalBody>
        <Dropzone onFilesUploaded={onFilesUploaded} />
        <p>
          {uploadedFiles.length} {uploadedFiles.length == 1 ? "file" : "files"}{" "}
          Selected
        </p>
        <div>
          {uploadedFiles.length == 0 ? (
            <p>No Files</p>
          ) : (
            <div>
              {uploadedFiles.map((file, i) => (
                <FileListItem
                  key={file.fileRef.name}
                  uploadedFile={file}
                  setMetadata={(metadata) =>
                    setUploadedFiles([
                      ...uploadedFiles.slice(0, i),
                      { ...file, metadata: metadata },
                      ...uploadedFiles.slice(i + 1),
                    ])
                  }
                  onRemove={() => removeFile(file)}
                />
              ))}
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={uploadFiles}
          disabled={uploadedFiles.length == 0}
          color="primary"
        >
          Upload
        </Button>
      </ModalFooter>
    </Modal>
  );
}

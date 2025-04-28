import { Drawer, message, Popover, Tag } from "antd";
import { debounce, isEmpty } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { CardCmp, DividerCmp } from "src/components/layouts/container";
import { FlatList, Icon, InputBox, LoaderCmp, LoaderWithChildren, ModalCmp, Para, SubHeading } from "src/components/styled";
import { ImageCropperUI } from "src/components/styled/inputs/imageUpload";
import { useAppDispatch, useBase, useColors } from "src/redux/hooks";
import { addEditCom, blockUnBlockUser, deleteMessage } from "src/views/communication/staff/redux/slice/main";
import { useCommunicationMainSlice } from "src/views/communication/staff/redux/store";
import CreateGroup from "../../createGroup";
import { deleteGroup, updateProfileInfo, useGroupMembers } from "./useIndex";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { useMutation } from "@tanstack/react-query";

export default function SelectedContactInfo({ open, setOpen }) {
  const { colorBgLayout } = useColors();
  const {
    chats: { selected_contact },
  } = useCommunicationMainSlice();
  const { isPending, updateGroup } = updateProfileInfo();
  const { group_members_data, is_group_admin, isLoadingGroupMembers } = useGroupMembers();

  return (
    <Drawer styles={{ body: { padding: 0 } }} style={{ backgroundColor: colorBgLayout }} title={selected_contact?.is_group ? "Group Info" : "Contact Info"} onClose={() => setOpen(false)} open={open}>
      <LoaderWithChildren isLoading={isPending}>
        <ProfilePart is_group_admin={is_group_admin} isPending={isPending} updateGroup={updateGroup} />
        {selected_contact?.is_group && (
          <GroupMembers group_members_data={group_members_data} isLoadingGroupMembers={isLoadingGroupMembers} is_group_admin={is_group_admin} isPending={isPending} updateGroup={updateGroup} />
        )}
        <CloseDeleteChat is_group_admin={is_group_admin} updateGroup={updateGroup} />
      </LoaderWithChildren>
    </Drawer>
  );
}

const ProfilePart = ({ isPending, updateGroup, is_group_admin }) => {
  const {
    chats: { selected_contact },
  } = useCommunicationMainSlice();

  const controlledUpdateGroup = debounce(updateGroup, 1000);

  let image_name = useMemo(() => {
    if (selected_contact?.is_group) return { image: selected_contact?.image, name: selected_contact?.name };
    else if (selected_contact?.student_id) return { image: selected_contact?.student?.applicant?.image, name: selected_contact?.student?.applicant?.name };
    else return { image: selected_contact?.staff?.image, name: selected_contact?.staff?.name };
  }, [selected_contact]);

  return (
    <CardCmp className="rounded-0">
      <LoaderWithChildren isLoading={isPending} className="daj">
        <ImageCropperUI
          disabled={!selected_contact?.is_group || !is_group_admin}
          imageUrl={image_name?.image}
          handleChange={(val) => controlledUpdateGroup({ group: { image: val }, group_id: selected_contact?.id })}
        />
      </LoaderWithChildren>
      <NameDescription is_group_admin={is_group_admin} updateGroup={updateGroup} image_name={image_name} selected_contact={selected_contact} />
    </CardCmp>
  );
};

const NameDescription = ({ image_name, selected_contact, updateGroup, is_group_admin }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [value, setValue] = useState({ name: "", description: "" });

  const handleSave = () => {
    updateGroup(
      { group: value, group_id: selected_contact?.id },
      {
        onSettled() {
          setIsEdit(false);
        },
      }
    );
  };

  const setDefault = () => setValue({ name: selected_contact?.name, description: selected_contact?.description });

  const handleDiscard = () => {
    setDefault();
    setIsEdit(false);
  };

  useEffect(() => {
    setDefault();
  }, [selected_contact]);

  return (
    <>
      <div className=" mt-3">
        {isEdit ? (
          <>
            <div className="df">
              <div className="me-3">
                <InputBox value={value?.name} onChange={(e) => setValue((prev) => ({ ...prev, name: e?.target?.value }))} placeholder="Group Name" autoFocus />
                <InputBox value={value?.description} onChange={(e) => setValue((prev) => ({ ...prev, description: e?.target?.value }))} type="textarea" className="mt-2" placeholder="Description" />
              </div>
              <div>
                <Icon onClick={handleSave} className="fa-solid fa-check cp text-success" />
                <Icon onClick={handleDiscard} className="fa-solid fa-xmark cp text-danger mt-3" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="daj">
              <SubHeading className="text-center mb-0 me-3">{image_name?.name}</SubHeading>
              {selected_contact?.is_group && is_group_admin && <Icon onClick={() => setIsEdit(true)} className="fa-solid fa-pen cp" />}
            </div>
            <Para className="text-center">{selected_contact?.description}</Para>
          </>
        )}
      </div>
    </>
  );
};

const CloseDeleteChat = ({ updateGroup, is_group_admin }) => {
  const {
    chats: { selected_contact, selected_contact_info },
  } = useCommunicationMainSlice();
  const { colorError } = useColors();
  const {
    user: { info },
  } = useBase();
  const dispatch = useAppDispatch();
  const { Modal, setIsOpen } = useConfirmationModal();
  const { Modal: ExitModel, setIsOpen: setExitIsOpen } = useConfirmationModal();
  const { Modal: DeleteModal, setIsOpen: setDeleteIsOpen } = useConfirmationModal();

  const { mutate: deleteGroupMutate, isPending: isLoadingDeleteGroup } = useMutation({ mutationKey: ["delete/group"], mutationFn: deleteGroup });

  let image_name = useMemo(() => {
    if (selected_contact?.is_group) return { image: selected_contact?.image, name: selected_contact?.name };
    else if (selected_contact?.student_id) return { image: selected_contact?.student?.applicant?.image, name: selected_contact?.student?.applicant?.name };
    else return { image: selected_contact?.staff?.image, name: selected_contact?.staff?.name };
  }, [selected_contact]);

  let arr = useMemo(() => {
    let arr = [];
    if (selected_contact?.is_group) {
      arr.push({
        icon: "fa-solid fa-arrow-right-from-bracket",
        label: "Exit Group",
        id: "exit_group",
        props: {
          onClick: () => setExitIsOpen(true),
        },
      });
      if (is_group_admin)
        arr.push({
          icon: "fa-regular fa-trash-can",
          label: `Delete Group`,
          id: "delete_group",
          props: {
            onClick: () => setIsOpen(true),
          },
        });
    } else
      arr.push(
        selected_contact_info?.i_is_blocked
          ? {
              icon: "fa-solid fa-ban",
              label: `Unblock ${image_name?.name}`,
              id: "unblock",
              props: {
                onClick: () => dispatch(blockUnBlockUser({ type: "unblock", user_id: selected_contact?.id })),
              },
            }
          : {
              icon: "fa-solid fa-ban",
              label: `Block ${image_name?.name}`,
              id: "block",
              props: {
                onClick: () => dispatch(blockUnBlockUser({ type: "block", user_id: selected_contact?.id })),
              },
            },
        {
          icon: "fa-regular fa-trash-can",
          label: `Delete Chat`,
          id: "delete",
          props: {
            onClick: () => setDeleteIsOpen(true),
          },
        }
      );
    return arr;
  }, [selected_contact, is_group_admin, selected_contact_info]);

  const handleExit = () => {
    updateGroup({ group_id: selected_contact?.id, removed_user: [info?.user?.id] });
    dispatch(addEditCom({ key: "selected_contact", obj: "chats", value: null }));
  };

  return (
    <CardCmp className="mt-1">
      <LoaderWithChildren isLoading={isLoadingDeleteGroup}>
        <FlatList
          data={arr}
          renderItem={(item) => (
            <div {...item?.props} key={item?.id} className="p-2 mb-1 cp dajc">
              <div style={{ width: "45px" }}>
                <Icon style={{ color: colorError }} className={item?.icon} />
              </div>
              <Para style={{ color: colorError }} className="f1 ">
                {item?.label}
              </Para>
            </div>
          )}
        />
      </LoaderWithChildren>
      <Modal description="Delete group?" okButtonProps={{ onClick: () => deleteGroupMutate({ id: selected_contact?.id }) }} />
      <ExitModel description="Exit group?" okButtonProps={{ onClick: handleExit }} />
      <DeleteModal
        description="Delete chats?"
        okButtonProps={{
          onClick: () => {
            dispatch(deleteMessage({ user_id: selected_contact?.id }));
            setDeleteIsOpen(false);
          },
        }}
      />
    </CardCmp>
  );
};

const GroupMembers = ({ isPending, updateGroup, group_members_data, is_group_admin, isLoadingGroupMembers }) => {
  return (
    <CardCmp title={`${group_members_data?.length ?? 0} Members`} className="mt-1">
      {isLoadingGroupMembers ? (
        <div className="my-3 text-center">
          <LoaderCmp />
        </div>
      ) : (
        <>
          {is_group_admin && <AddMembers isPending={isPending} updateGroup={updateGroup} group_members_data={group_members_data} />}
          <FlatList data={group_members_data} renderItem={(user) => <SepContact updateGroup={updateGroup} is_group_admin={is_group_admin} key={user?.id} user={user} />} />
        </>
      )}
    </CardCmp>
  );
};

const SepContact = ({ user, is_group_admin, updateGroup }) => {
  const {
    chats: { selected_contact },
  } = useCommunicationMainSlice();

  let image_name = useMemo(() => {
    let is_std = user?.student_id;
    return {
      image: is_std ? user?.student?.applicant?.image : user?.staff?.image,
      name: is_std ? user?.student?.applicant?.name : user?.staff?.name,
    };
  }, [user]);

  const items = useMemo(() => {
    let arr = [];
    if (is_group_admin) {
      arr.push({
        key: "remove",
        label: "Remove",
        d_attributes: {
          onClick() {
            updateGroup({ group_id: selected_contact?.id, removed_user: [user?.id] });
          },
        },
      });
      arr.push(
        user?.is_admin
          ? {
              key: "remove_as_admin",
              label: "Remove as admin",
              d_attributes: {
                onClick() {
                  updateGroup({ group_id: selected_contact?.id, removed_group_admins: [user?.id] });
                },
              },
            }
          : {
              key: "make_admin",
              label: "Make group admin",
              d_attributes: {
                onClick() {
                  updateGroup({ group_id: selected_contact?.id, group_admins: [user?.id] });
                },
              },
            }
      );
    }
    return arr;
  }, [user, is_group_admin]);

  const content = () =>
    items?.map((res) => (
      <div {...res?.d_attributes} className="cp p-1" key={res?.key}>
        <Para>{res?.label}</Para>
      </div>
    ));

  const User = () => (
    <div className="dajc mt-3 cp down_arrow_hover_show">
      <div style={{ width: "45px" }}>
        <img style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} src={image_name?.image} />
      </div>
      <div className="f1 ms-2">
        <Para>{image_name?.name}</Para>
        <div className="df">
          <div className="mt-1 f1">
            <Tag color={user?.student_id ? "gold" : "blue"}>{user?.student_id ? "Student" : "Staff"}</Tag>
            {user?.is_admin && <Tag color="green-inverse">Admin</Tag>}
          </div>
          {is_group_admin && <Icon className="fa-solid fa-chevron-down down_arrow" style={{ visibility: "hidden" }} />}
        </div>
      </div>
    </div>
  );

  if (is_group_admin)
    return (
      <Popover content={content} trigger={["click"]} placement="bottomRight">
        <div>
          <User />
        </div>
      </Popover>
    );
  else return <User />;
};

const AddMembers = ({ group_members_data, isPending, updateGroup }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    chats: { selected_contact },
  } = useCommunicationMainSlice();

  let exist_ids = useMemo(() => {
    try {
      return group_members_data?.map((res) => res?.id);
    } catch (error) {
      console.error(error);
    }
  }, [group_members_data]);

  const handleAdd = (ids) => {
    if (isEmpty(ids)) {
      setIsOpen(false);
      return message.info("No user added");
    }
    updateGroup(
      {
        group_id: selected_contact?.id,
        added_user: ids,
      },
      {
        onSuccess() {
          message.success("User added successfully");
        },
        onError(error) {
          message.error(error?.error);
        },
        onSettled() {
          setIsOpen(false);
        },
      }
    );
  };

  return (
    <div>
      <div onClick={() => setIsOpen(true)} className="p-2 mb-1 cp dajc">
        <div style={{ width: "45px" }}>
          <Icon className="fa-solid fa-plus" />
        </div>
        <Para className="f1 ">Add members</Para>
      </div>
      <DividerCmp className="my-1" />
      <ModalCmp onCancel={() => setIsOpen(false)} footer={null} title="Add Members" classNames={{ body: "reduce_scrollbar_width" }} open={isOpen} centered>
        <LoaderWithChildren isLoading={isPending} style={{ height: "70vh", overflowY: "auto" }}>
          <CreateGroup handleAdd={handleAdd} already_in_group={exist_ids} />
        </LoaderWithChildren>
      </ModalCmp>
    </div>
  );
};

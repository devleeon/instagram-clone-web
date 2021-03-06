import { gql, useMutation } from "@apollo/client";
import React, { useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import Avatar, { MyAvatar } from "../../Components/Avatar";
import { CREATE_CHAT, MYAVATAR } from "../../Components/SharedQueries";

const UserInfo = styled.header`
  background-color: ${(props) => props.theme.bgColor};
  display: flex;
  flex-direction: row;
  margin-bottom: 40px;
  margin-top: 5px;
`;
const AvatarWrapper = styled.div`
  max-width: 293px;
  width: 100%;
  display: flex;
  justify-content: center;
  border-radius: 50%;
  ${(props) => props.onClick && "cursor: pointer;"}
`;

const InfoWrapper = styled.section`
  padding: 8px 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;
const Username = styled.h2`
  font-size: 30px;
`;
const Numbers = styled.ul`
  margin-top: 20px;
  list-style: none;
  display: flex;
  flex-direction: row;
`;
const NumberText = styled.li`
  font-size: 16px;
  strong {
    font-weight: 600;
  }
  &:not(:last-child) {
    margin-right: 30px;
  }
`;
const OtherInfo = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
`;
const Name = styled.h1`
  font-weight: 600;
  font-size: 18px;
`;
const Bio = styled.span`
  margin-top: 5px;
`;
const FUEButton = styled.button`
  height: 30px;
  font-weight: 600;
  text-transform: uppercase;
  border: ${(props) => props.theme.boxBorder};
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: ${(props) => {
    if (props.name === "follow") return props.theme.blueColor;
    else return `white`;
  }};
  color: ${(props) => {
    if (props.name === "follow") return `white`;
    else return `black`;
  }};
  :focus {
    outline: none;
  }
  cursor: pointer;
`;
const EditLink = styled(Link)`
  cursor: pointer;
`;
export const FOLLOW = gql`
  mutation follow($username: String!) {
    follow(username: $username)
  }
`;
export const UNFOLLOW = gql`
  mutation unfollow($username: String!) {
    unfollow(username: $username)
  }
`;
const CHANGE_AVATAR = gql`
  mutation changeAvatar($avatar: Upload!) {
    changeAvatar(avatar: $avatar) {
      url
      error
    }
  }
`;
function ProfileHeader({
  id,
  username,
  isSelf,
  avatar,
  numberOfFollowings,
  numberOfPosts,
  numberOfFollowers,
  fullname,
  bio,
  amIFollowing,
}) {
  const history = useHistory();
  const [follow] = useMutation(FOLLOW, {
    variables: { username },
  });
  const [unfollow] = useMutation(UNFOLLOW, {
    variables: { username },
  });
  const [createChat] = useMutation(CREATE_CHAT, { variables: { toId: id } });
  const inputFile = useRef(null);

  const [avatarMutation] = useMutation(CHANGE_AVATAR);
  const changeAvatar = async (e) => {
    if (e.target.files[0]) {
      await avatarMutation({
        variables: { avatar: e.target.files[0] },
        refetchQueries: [{ query: MYAVATAR }],
        update: ({ loading }) => {
          if (!loading)
            toast.success(<div>Profile Photo has changed successfully!</div>);
        },
      });
    }
  };
  const handleMessage = async () => {
    // create chat room and push to the url
    await createChat({
      update: (_, { data }) => {
        const chat = data?.createChat?.id;
        history.push(`/direct/t/${chat}`);
      },
    });
  };
  const openFile = () => {
    inputFile.current.click();
  };
  const onClick = async (e) => {
    const {
      target: { name },
    } = e;
    switch (name) {
      case "follow":
        await follow({
          update: (cache, { data }) => {
            if (data?.follow) {
              cache.modify({
                id: `User:${id}`,
                fields: {
                  amIFollowing() {
                    return true;
                  },
                  numberOfFollowers(prev) {
                    return prev + 1;
                  },
                },
              });
            }
          },
        });
        break;
      case "unfollow":
        await unfollow({
          update: (cache, { data }) => {
            if (data?.unfollow) {
              cache.modify({
                id: `User:${id}`,
                fields: {
                  amIFollowing() {
                    return false;
                  },
                  numberOfFollowers(prev) {
                    return prev - 1;
                  },
                },
              });
            }
          },
        });
        break;

      default:
        //edit profile
        break;
    }
  };
  return (
    <>
      <input
        onChange={changeAvatar}
        type="file"
        ref={inputFile}
        style={{ display: "none" }}
        accept="image/*"
      />
      <UserInfo>
        {isSelf ? (
          <AvatarWrapper onClick={openFile}>
            <MyAvatar size={150} />
          </AvatarWrapper>
        ) : (
          <AvatarWrapper>
            <Avatar src={avatar} size={150} />
          </AvatarWrapper>
        )}

        <InfoWrapper>
          <Username>
            {username}{" "}
            {!isSelf ? (
              //message link create and push
              <FUEButton onClick={handleMessage}>message</FUEButton>
            ) : (
              <Link to="/p/create">
                <FUEButton>create post</FUEButton>
              </Link>
            )}
            {isSelf ? (
              <EditLink to="/account/edit">
                <FUEButton name="edit" onClick={onClick}>
                  edit profile
                </FUEButton>
              </EditLink>
            ) : amIFollowing ? (
              <FUEButton name="unfollow" onClick={onClick}>
                unfollow
              </FUEButton>
            ) : (
              <FUEButton name="follow" onClick={onClick}>
                follow
              </FUEButton>
            )}
          </Username>
          <Numbers>
            <NumberText>
              게시물 <strong>{numberOfPosts}</strong>
            </NumberText>
            <NumberText>
              팔로워 <strong>{numberOfFollowers}</strong>
            </NumberText>
            <NumberText>
              팔로잉 <strong>{numberOfFollowings}</strong>
            </NumberText>
          </Numbers>
          <OtherInfo>
            <Name>{fullname}</Name>
            <Bio>{bio}</Bio>
          </OtherInfo>
        </InfoWrapper>
      </UserInfo>
    </>
  );
}

export default ProfileHeader;

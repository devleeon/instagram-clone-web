import { gql, useQuery } from "@apollo/client";
import React from "react";
import styled from "styled-components";
import Avatar from "../../Components/Avatar";
import Loader from "../../Components/Loader";
import useMeQuery from "../../Hooks/useMeQuery";
import useWidth from "../../Hooks/useWidth";
import FeedPostContainer from "../FeedPost/FeedPostContainer";
import FeedStory from "../FeedStory";

const FEED_QUERY = gql`
  query getFeed {
    getFeed {
      id
      caption
      isLiked
      createdAt
      location
      comments {
        text
        user {
          username
        }
        createdAt
        id
      }
      likes {
        id
        user {
          username
        }
      }
      photos {
        id
        url
      }
      numberOfLikes
      user {
        avatar
        amIFollowing
        username
      }
    }
  }
`;

const Wrapper = styled.section`
  padding-top: ${(props) => {
    if (props.width < 640) {
      return `0;`;
    } else {
      return `30px;`;
    }
  }};
  max-width: 935px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  vertical-align: top;
`;
const Feed = styled.div`
  display: flex;
  flex-direction: column;
  ${(props) => {
    if (props.width < 1000) {
      return `margin:auto;`;
    } else {
      return `margin-right: 28px;`;
    }
  }}
`;
const Etc = styled.div`
  ${(props) => props.theme.whiteBox};
  background-color: ${(props) => props.theme.bgColor};
  border: 0;
  position: fixed;
  left: ${(props) => props.width / 2 + 170}px;
  top: 88px;
`;
const Me = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  vertical-align: center;
  align-items: center;
`;
const MeInfo = styled.div`
  margin-left: 20px;
  display: flex;
  flex-direction: column;
`;
const MeUsername = styled.div`
  font-weight: 600;
  font-size: 16px;
`;
const MeName = styled.div`
  font-size: 18px;
  color: ${(props) => props.theme.darkGreyColor};
  font-weight: 300;
`;
const Loading = styled.div`
  margin: 20px auto;
  width: 100%;
  align-items: center;
`;
function FeedContainer() {
  const { loading, data, fetchMore } = useQuery(FEED_QUERY, { variables: {} });
  const {
    data: { me },
  } = useMeQuery();
  const width = useWidth();
  return (
    <Wrapper width={width}>
      {!loading && data ? (
        <>
          <Feed width={width}>
            <FeedStory />
            {data.getFeed.map((post, index) => {
              return (
                <FeedPostContainer
                  key={index}
                  id={post.id}
                  photos={post.photos}
                  user={post.user}
                  isLiked={post.isLiked}
                  comments={post.comments}
                  createdAt={post.createdAt}
                  numberOfLikes={post.numberOfLikes}
                  caption={post.caption}
                />
              );
            })}
          </Feed>
          {width < 1000 ? null : (
            <Etc width={width}>
              <Me>
                <Avatar src={me.avatar} size={56} />
                <MeInfo>
                  <MeUsername>{me.username}</MeUsername>
                  <MeName>{me.fullname}</MeName>
                </MeInfo>
              </Me>
            </Etc>
          )}
        </>
      ) : (
        <Loading>
          <Loader />
        </Loading>
      )}
    </Wrapper>
  );
}

export default FeedContainer;
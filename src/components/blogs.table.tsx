import Table from 'react-bootstrap/Table';
import { useState, useEffect, forwardRef } from 'react';
import Button from 'react-bootstrap/Button';
import BlogCreateModal from './modal/blog.create.modal';
import BlogEditModal from './modal/blog.edit.modal';
import BlogDeleteModal from './modal/blog.delete.modal';
import UsersPagination from './pagination/users.pagination';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { calculatePagesCount } from '../helper';
import { OverlayTrigger, Popover } from 'react-bootstrap';

interface IBlog {
  id: number;
  title: string;
  author: string;
  content: string;
}

const PAGE_SIZE = 5;

function BlogsTable() {
  const [isOpenCreateModal, setIsOpenCreateModal] = useState<boolean>(false);
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState<boolean>(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);

  const [dataBlog, setDataBlog] = useState({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  const {
    isPending,
    error,
    data: blogs,
  } = useQuery({
    queryKey: ['fetchBlogs', currentPage],
    queryFn: (): Promise<IBlog[]> =>
      fetch(`http://localhost:8000/blogs?_page=${currentPage}&_limit=${PAGE_SIZE}`).then((res) => {
        const total_items = +(res.headers?.get('X-Total-Count') ?? 0);
        const page_size = PAGE_SIZE;
        setTotalPage(calculatePagesCount(page_size, total_items));
        return res.json();
      }),
    placeholderData: keepPreviousData,
  });

  if (isPending) return 'Loading...';

  if (error) return 'An error has occurred: ' + error.message;

  const handleEditBlog = (blog: any) => {
    setDataBlog(blog);
    setIsOpenUpdateModal(true);
  };

  const handleDelete = (blog: any) => {
    setDataBlog(blog);
    setIsOpenDeleteModal(true);
  };

  const PopoverComponent = forwardRef((props: any, ref: any) => {
    const { id } = props;

    const {
      isPending,
      error,
      data: blog,
    } = useQuery({
      queryKey: ['fetchBlog', id],
      queryFn: (): Promise<IBlog> =>
        fetch(`http://localhost:8000/blogs/${id}`).then((res) => res.json()),
    });

    const getBody = () => {
      if (isPending) return 'Loading detail ...';
      if (error) return 'An error has occurred: ' + error.message;
      if (blog) {
        return (
          <>
            <div>ID = {id}</div>
            <div>Title = {blog?.title}</div>
            <div>Author = {blog?.author}</div>
          </>
        );
      }
    };

    return (
      <Popover ref={ref} {...props}>
        <Popover.Header as='h3'>Detail User</Popover.Header>
        <Popover.Body>{getBody()}</Popover.Body>
      </Popover>
    );
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0' }}>
        <h4>Table Blogs</h4>
        <Button variant='primary' onClick={() => setIsOpenCreateModal(true)}>
          Add New
        </Button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Author</th>
            <th>Content</th>
          </tr>
        </thead>
        <tbody>
          {blogs?.map((blog) => {
            return (
              <tr key={blog.id}>
                <OverlayTrigger
                  trigger='click'
                  placement='right'
                  rootClose
                  overlay={<PopoverComponent id={blog.id} />}
                >
                  <td>
                    <a href='#'>{blog.id}</a>
                  </td>
                </OverlayTrigger>
                <td>{blog.title}</td>
                <td>{blog.author}</td>
                <td>{blog.content}</td>

                <td>
                  <Button variant='warning' onClick={() => handleEditBlog(blog)} className='mb-3'>
                    Edit
                  </Button>
                  &nbsp;&nbsp;&nbsp;
                  <Button variant='danger' onClick={() => handleDelete(blog)}>
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <UsersPagination
        totalPages={totalPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <BlogCreateModal
        isOpenCreateModal={isOpenCreateModal}
        setIsOpenCreateModal={setIsOpenCreateModal}
      />

      <BlogEditModal
        isOpenUpdateModal={isOpenUpdateModal}
        setIsOpenUpdateModal={setIsOpenUpdateModal}
        dataBlog={dataBlog}
      />

      <BlogDeleteModal
        dataBlog={dataBlog}
        isOpenDeleteModal={isOpenDeleteModal}
        setIsOpenDeleteModal={setIsOpenDeleteModal}
      />
    </>
  );
}

export default BlogsTable;

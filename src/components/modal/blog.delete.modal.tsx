import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';

const BlogDeleteModal = (props: any) => {
  const { dataBlog, isOpenDeleteModal, setIsOpenDeleteModal } = props;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`http://localhost:8000/blogs/${payload.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': ' application/json',
        },
      });
      return res.json();
    },
    onSuccess: () => {
      toast('🦄 Wow so easy!');
      setIsOpenDeleteModal(false);
      queryClient.invalidateQueries({ queryKey: ['fetchBlogs'] });
    },
  });

  const handleSubmit = () => {
    mutation.mutate({ id: dataBlog?.id });
  };

  return (
    <Modal
      show={isOpenDeleteModal}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      backdrop={false}
      onHide={() => setIsOpenDeleteModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Delete A Blog</Modal.Title>
      </Modal.Header>
      <Modal.Body>Delete the blog: {dataBlog?.title ?? ''}</Modal.Body>
      <Modal.Footer>
        {!mutation.isPending ? (
          <>
            <Button variant='warning' onClick={() => setIsOpenDeleteModal(false)} className='mr-2'>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit()}>Confirm</Button>
          </>
        ) : (
          <Button variant='primary' disabled>
            <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true' />
            <></>Loading...
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BlogDeleteModal;

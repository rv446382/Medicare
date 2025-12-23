import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';

import { update } from '../store/slices/UserSlice';
import api from '../services/api';

const MyProfile = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);

    const [isEdit, setIsEdit] = useState(false);
    const [image, setImage] = useState(null);
    const [updatedUserData, setUpdatedUserData] = useState({});

    const updateUserProfileData = async () => {
        try {
            const formData = new FormData();

            formData.append('name', updatedUserData.name);
            formData.append('phone', updatedUserData.phone);
            formData.append('address', JSON.stringify(updatedUserData.address));
            formData.append('gender', updatedUserData.gender);
            formData.append('dob', updatedUserData.dob);

            if (image) {
                // Append the image file (not the temporary URL)
                formData.append('image', image);
            }

            const { data } = await api.post('/user/update-profile', formData, {
                headers: {
                    "Content-Type": 'multipart/form-data'
                }
            });

            if (data.success) {
                toast.success(data.message);

                const updatedData = {
                    ...updatedUserData,
                    ...(image ? { image: data.imageUrl } : {}),
                };

                dispatch(update(updatedData));

                setIsEdit(false);
                setImage(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        setUpdatedUserData({ ...user });
        console.log(user);
    }, [user]);

    return user ? (
        <div className='max-w-lg flex flex-col gap-2 text-sm pt-5'>
            {isEdit ? (
                <label htmlFor='image'>
                    <div className='inline-block relative cursor-pointer'>
                        <img
                            className='w-36 rounded opacity-75'
                            src={image ? URL.createObjectURL(image) : user.image}
                            alt='Profile'
                        />
                    </div>
                    <input
                        onChange={(e) => setImage(e.target.files[0])}
                        type='file'
                        id='image'
                        hidden
                    />
                </label>
            ) : (
                <img className='w-36 rounded' src={user.image} alt='Profile' />
            )}

            {isEdit ? (
                <input
                    className='bg-gray-50 text-3xl font-medium max-w-60'
                    type='text'
                    onChange={(e) =>
                        setUpdatedUserData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    value={updatedUserData.name}
                />
            ) : (
                <p className='font-medium text-3xl text-[#262626] mt-4'>{user.name}</p>
            )}

            <hr className='bg-[#ADADAD] h-[1px] border-none' />

            <div>
                <p className='text-gray-600 underline mt-3'>CONTACT INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]'>
                    <p className='font-medium'>Email id:</p>
                    <p className='text-blue-500'>{user.email}</p>
                    <p className='font-medium'>Phone:</p>
                    {isEdit ? (
                        <input
                            className='bg-gray-50 max-w-52'
                            type='text'
                            onChange={(e) =>
                                setUpdatedUserData((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            value={updatedUserData.phone}
                        />
                    ) : (
                        <p className='text-blue-500'>{user.phone}</p>
                    )}

                    <p className='font-medium'>Address:</p>
                    {isEdit ? (
                        <div>
                            <input
                                className='bg-gray-50'
                                type='text'
                                onChange={(e) =>
                                    setUpdatedUserData((prev) => ({
                                        ...prev,
                                        address: { ...prev.address, line1: e.target.value },
                                    }))
                                }
                                value={updatedUserData.address?.line1}
                            />
                            <br />
                            <input
                                className='bg-gray-50'
                                type='text'
                                onChange={(e) =>
                                    setUpdatedUserData((prev) => ({
                                        ...prev,
                                        address: { ...prev.address, line2: e.target.value },
                                    }))
                                }
                                value={updatedUserData.address?.line2}
                            />
                        </div>
                    ) : (
                        <p className='text-gray-500'>
                            {user.address.line1} <br /> {user.address.line2}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <p className='text-[#797979] underline mt-3'>BASIC INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
                    <p className='font-medium'>Gender:</p>
                    {isEdit ? (
                        <select
                            className='max-w-20 bg-gray-50'
                            onChange={(e) =>
                                setUpdatedUserData((prev) => ({ ...prev, gender: e.target.value }))
                            }
                            value={updatedUserData.gender}
                        >
                            <option value='Not Selected'>Not Selected</option>
                            <option value='Male'>Male</option>
                            <option value='Female'>Female</option>
                        </select>
                    ) : (
                        <p className='text-gray-500'>{user.gender}</p>
                    )}

                    <p className='font-medium'>Birthday:</p>
                    {isEdit ? (
                        <input
                            className='max-w-28 bg-gray-50'
                            type='date'
                            onChange={(e) =>
                                setUpdatedUserData((prev) => ({ ...prev, dob: e.target.value }))
                            }
                            value={updatedUserData.dob}
                        />
                    ) : (
                        <p className='text-gray-500'>{user.dob}</p>
                    )}
                </div>
            </div>

            <div className='mt-10'>
                {isEdit ? (
                    <button
                        onClick={updateUserProfileData}
                        className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
                    >
                        Save information
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEdit(true)}
                        className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
    ) : null;
};

export default MyProfile;

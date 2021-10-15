import {useForm} from 'react-hook-form';
import {TransactionsContext} from '../contexts/TransactionsProvider.js';
import {useContext, useEffect} from 'react';

export default function AddTransactionForm({places}) {
  const {
    register,
    handleSubmit,
    formState: {errors},
    reset,
    setValue,
  } = useForm();

  const {currentTransaction, setTransactionToUpdate, createOrUpdateTransaction} =
    useContext(TransactionsContext);

  useEffect(() => {
    if (
      // check on non-empty object
      currentTransaction &&
      (Object.keys(currentTransaction).length !== 0 ||
        currentTransaction.constructor !== Object)
    ) {
      const dateAsString = toDateInputString(new Date(currentTransaction.date));
      setValue('date', dateAsString);
      setValue('user', currentTransaction.user.name);
      setValue('place', currentTransaction.place.name);
      setValue('amount', currentTransaction.amount);
    } else {
      reset();
    }
  }, [currentTransaction, setValue, reset]);

  const onSubmit = (data) => {
    createOrUpdateTransaction({
      id: currentTransaction?.id,
      placeId: places.find((p) => p.name === data.place).id,
      amount: data.amount,
      date: new Date(data.date),
      user: data.user
    })
      .then(() => setTransactionToUpdate(null))
      .catch(console.error);
  };

  const LabelInput = ({label, type, defaultValue, validation, ...rest}) => {
    return (
      <div className="col-span-6 sm:col-span-3">
        <label htmlFor={label}>{label}</label>
        <input
          {...register(label, validation)}
          defaultValue={defaultValue}
          placeholder={label}
          type={type}
          id={label}
          name={label}
          {...rest}
        />
        {errors[label] && <p className="text-red-500">{errors[label].message}</p>}
      </div>
    );
  };

  const LabelSelect = ({label, options, defaultValue, validation, ...rest}) => {
    return (
      <div className="col-span-6 sm:col-span-3">
        <label htmlFor={label}>{label}</label>
        <select
          {...register(label, validation)}
          defaultValue={defaultValue}
          {...rest}
          id={label}
          name={label}>
          {options.map((value) => (
            <option key={value.id} value={value.name}>
              {value.name}
            </option>
          ))}
        </select>
        {errors[label] && <p className="text-red-500">{errors[label].message}</p>}
      </div>
    );
  };

  const toDateInputString = (date) => {
    // (toISOString returns something like 2020-12-05T14:15:74Z,
    // date HTML5 input elements expect 2020-12-05
    //
    if (!date) return null;
    if (typeof date !== Object) {
      date = new Date(date);
    }
    let asString = date.toISOString();
    return asString.substring(0, asString.indexOf('T'));
  };

  const cancel = () => {
    setTransactionToUpdate();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="m-5">
      <div className="grid grid-cols-6 gap-6">
        <LabelInput
          label="user"
          type="text"
          defaultValue=""
          validation={{
            required: 'this is required',
            minLength: {value: 2, message: 'Min length is 2'},
          }}
        />
        <LabelInput
          label="date"
          type="date"
          defaultValue={toDateInputString(new Date())}
          validation={{required: 'this is required'}}
        />
        <LabelSelect
          label="place"
          defaultValue="hogent"
          options={places}
          validation={{required: 'This is required'}}
        />
        <LabelInput
          label="amount"
          type="number"
          defaultValue="0"
          validation={{
            valueAsNumber: true,
            required: 'this is required',
            min: {value: 1, message: 'min 1'},
            max: {value: 5000, message: 'max 5000'},
          }}
        />

        <div className="col-span-6 sm:col-span-3">
          <div className="flex justify-end">
            <button type="submit"> {currentTransaction?.id ? 'Save Transaction' : 'Add Transaction'}</button>
            {currentTransaction?.id ? <button onClick={cancel}>Cancel</button> : ''}
          </div>
        </div>
      </div>
    </form>
  );
}

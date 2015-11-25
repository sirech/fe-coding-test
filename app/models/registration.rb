class Registration < ActiveRecord::Base
  validates :name, presence: true, length: { minimum: 2 }
  validates :lastname, presence: true, length: { minimum: 2 }
  validates :email, presence: true, length: { minimum: 2 }
  validates :age, presence: true, numericality: { only_integer: true }
  validates :gender, presence: true
end

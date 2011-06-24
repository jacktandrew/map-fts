class Neighborhood < ActiveRecord::Base
  has_many :addresses
  has_many :spots, :through => :addresses

  accepts_nested_attributes_for :addresses, :allow_destroy => true
end
